import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService, Page, Query, pageOf } from '../../core/api/api.service';

/** One installment plan (a loan or advance repaid monthly). Money values are numbers; the server calculates paid/remaining. */
export interface InstallmentPlan {
  id: number;
  employee: string;
  department: string;
  costCenter: string;
  type: string;
  total: number;
  count: number;
  /** ISO date of the first installment. */
  start: string;
  paid: number;
  remaining: number;
  notes: string;
  cancelled: boolean;
}
export type LineStatus = 'مسدد' | 'غير مسدد';
export interface InstallmentLine { no: number; due: string; amount: number; status: LineStatus; paidOn: string; notes: string; }
export interface InstallmentDetails { plan: InstallmentPlan; lines: InstallmentLine[]; }
export type PlanState = 'ملغي' | 'منتهي' | 'جاري السداد';
export const planState = (p: InstallmentPlan): PlanState => (p.cancelled ? 'ملغي' : p.remaining <= 0 ? 'منتهي' : 'جاري السداد');

const r2 = (n: number) => Math.round(n * 100) / 100;
const addMonths = (iso: string, m: number) => {
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1 + m, Math.min(d, 28)));
  return dt.toISOString().slice(0, 10);
};
/** Builds the monthly schedule; the last line absorbs rounding so the lines always add up to the total. */
function schedule(total: number, count: number, start: string, paidCount: number): InstallmentLine[] {
  const each = r2(total / count);
  return Array.from({ length: count }, (_, i) => {
    const amount = i === count - 1 ? r2(total - each * (count - 1)) : each;
    const due = addMonths(start, i);
    const paid = i < paidCount;
    return { no: i + 1, due, amount, status: paid ? 'مسدد' : 'غير مسدد', paidOn: paid ? addMonths(due, 0).replace(/-\d\d$/, '-27') : '', notes: i === 3 && paid ? 'سداد معجل' : '' };
  });
}
function totals(plan: InstallmentPlan, lines: InstallmentLine[]): InstallmentPlan {
  const total = r2(lines.reduce((a, l) => a + l.amount, 0));
  const paid = r2(lines.filter((l) => l.status === 'مسدد').reduce((a, l) => a + l.amount, 0));
  return { ...plan, total, count: lines.length, paid, remaining: r2(total - paid) };
}

/** Demo store used while environment.useMock = true. */
class MockStore {
  private seq = 100;
  private data = new Map<number, InstallmentDetails>();
  constructor() {
    const seed: [string, string, string, string, number, number, string, number, string, boolean][] = [
      ['أحمد سالم عبد العال سليم', 'الشئون المالية', 'المركز الرئيسي', 'جمعية المساعدات الاجتماعية', 1900, 4, '2018-07-10', 4, '', false],
      ['أحمد زكريا محمد علي', 'الموارد البشرية', 'المركز الرئيسي', 'قرض بنك مصر', 3840, 12, '2024-01-01', 7, 'جاري السداد', false],
      ['محمد علي حسن', 'الشئون القانونية', 'قطاع أسيوط', 'قرض إسكان', 6000, 24, '2025-06-01', 6, '', false],
      ['سمير أحمد الجوهري', 'تقنية المعلومات', 'قطاع سوهاج', 'سلفة مؤقتة', 1200, 6, '2024-03-15', 2, 'ألغي بقرار', true],
      ['خالد إبراهيم الشيخ', 'المشتريات', 'قطاع قنا', 'نقابة', 900, 9, '2026-01-01', 10, '', false],
    ];
    seed.forEach(([employee, department, costCenter, type, total, count, start, paidCount, notes, cancelled], i) => {
      const lines = schedule(total, count, start, Math.min(paidCount, count));
      this.data.set(i + 1, { plan: totals({ id: i + 1, employee, department, costCenter, type, total, count, start, paid: 0, remaining: 0, notes, cancelled }, lines), lines });
    });
  }
  list(q: Query): InstallmentPlan[] {
    const from = String(q['from'] ?? ''), to = String(q['to'] ?? '');
    return [...this.data.values()].map((d) => d.plan).filter((p) =>
      (!q['type'] || p.type === q['type']) && (!q['department'] || p.department === q['department']) &&
      (!q['costCenter'] || p.costCenter === q['costCenter']) && (!q['employee'] || p.employee === q['employee']) &&
      (!from || p.start >= from) && (!to || p.start <= to) &&
      (q['cancelled'] === 'true' ? p.cancelled : true) && (q['finished'] === 'true' ? p.remaining <= 0 : true));
  }
  get(id: number) { const d = this.data.get(id); return d ? structuredClone(d) : null; }
  save(p: InstallmentPlan): InstallmentPlan {
    const old = this.data.get(p.id);
    if (old) {
      // Changing total/count/start rebuilds the unpaid part of the schedule.
      const paidLines = old.lines.filter((l) => l.status === 'مسدد');
      const changed = old.plan.total !== p.total || old.plan.count !== p.count || old.plan.start !== p.start;
      let lines = old.lines;
      if (changed) {
        const restCount = Math.max(1, p.count - paidLines.length);
        const rest = schedule(r2(p.total - paidLines.reduce((a, l) => a + l.amount, 0)), restCount, addMonths(p.start, paidLines.length), 0)
          .map((l, i) => ({ ...l, no: paidLines.length + i + 1 }));
        lines = [...paidLines, ...rest];
      }
      const plan = totals({ ...old.plan, ...p }, lines);
      this.data.set(p.id, { plan, lines });
      return plan;
    }
    const id = ++this.seq;
    const lines = schedule(p.total, p.count, p.start, 0);
    const plan = totals({ ...p, id }, lines);
    this.data.set(id, { plan, lines });
    return plan;
  }
  remove(id: number) { this.data.delete(id); }
  saveLine(id: number, line: InstallmentLine) {
    const d = this.data.get(id)!;
    const lines = d.lines.map((l) => (l.no === line.no ? { ...line } : l));
    const plan = totals(d.plan, lines);
    this.data.set(id, { plan, lines });
    return structuredClone({ plan, lines });
  }
  removeLine(id: number, no: number) {
    const d = this.data.get(id)!;
    const lines = d.lines.filter((l) => l.no !== no).map((l, i) => ({ ...l, no: i + 1 }));
    const plan = totals(d.plan, lines);
    this.data.set(id, { plan, lines });
    return structuredClone({ plan, lines });
  }
}

/**
 * GET /installments?type=&department=&costCenter=&employee=&from=&to=&cancelled=&finished=&page=&pageSize=
 *   → Page<InstallmentPlan> + summary { total, paid, remaining } for all matching rows
 * POST /installments · PUT /installments/:id · DELETE /installments/:id · POST /installments/:id/cancel
 * GET /installments/:id → { plan, lines } · PUT|DELETE /installments/:id/lines/:no → { plan, lines }
 */
@Injectable({ providedIn: 'root' })
export class InstallmentsService {
  private readonly api = inject(ApiService);
  private readonly mock = new MockStore();

  types() { return this.api.get<string[]>('/installments/types', undefined, () => ['جمعية المساعدات الاجتماعية', 'قرض بنك مصر', 'قرض إسكان', 'سلفة مؤقتة', 'نقابة']); }

  list(q: Query) {
    return this.api.get<Page<InstallmentPlan> & { summary: { total: number; paid: number; remaining: number } }>('/installments', q, () => {
      const all = this.mock.list(q);
      const sum = (k: 'total' | 'paid' | 'remaining') => r2(all.filter((p) => !p.cancelled).reduce((a, p) => a + p[k], 0));
      return { ...pageOf(all, +(q['page'] ?? 1), +(q['pageSize'] ?? 10)), summary: { total: sum('total'), paid: sum('paid'), remaining: sum('remaining') } };
    });
  }
  save(p: InstallmentPlan, isNew: boolean) {
    return isNew
      ? this.api.post<InstallmentPlan>('/installments', { ...p, id: undefined }, () => this.mock.save({ ...p, id: 0 }))
      : this.api.put<InstallmentPlan>(`/installments/${p.id}`, p, () => this.mock.save(p));
  }
  /** Cancelling is a status change, kept separate from editing. */
  setCancelled(p: InstallmentPlan, cancelled: boolean) {
    return this.api.post<InstallmentPlan>(`/installments/${p.id}/${cancelled ? 'cancel' : 'restore'}`, {}, () => this.mock.save({ ...p, cancelled }));
  }
  remove(id: number) { return this.api.delete(`/installments/${id}`, () => this.mock.remove(id)); }

  details(id: number) {
    return this.api.get<InstallmentDetails | null>(`/installments/${id}`, undefined, () => this.mock.get(id)).pipe(map((d) => d));
  }
  saveLine(id: number, line: InstallmentLine) { return this.api.put<InstallmentDetails>(`/installments/${id}/lines/${line.no}`, line, () => this.mock.saveLine(id, line)); }
  removeLine(id: number, no: number) { return this.api.delete<InstallmentDetails>(`/installments/${id}/lines/${no}`, () => this.mock.removeLine(id, no)); }
}
