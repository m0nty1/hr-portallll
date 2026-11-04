import { Injectable, inject } from '@angular/core';
import { ApiService, Page, Query, pageOf } from '../../core/api/api.service';
import { MOCK_ABSENCE, MOCK_LEAVE_BALANCES, MOCK_PENALTIES } from './mock-data';
import { AbsenceRow, LeaveBalanceRow, PenaltyRow } from './models';

/** Mock filter for department/date range (the real API filters on the server). Dates are ISO. */
function inRange(date: string, q: Query) {
  const from = String(q['from'] ?? ''), to = String(q['to'] ?? '');
  return (!from || date >= from) && (!to || date <= to);
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly api = inject(ApiService);
  /** GET /attendance/absences?department=&employee=&type=&from=&to=&page=&pageSize= */
  absences(q: Query) {
    return this.api.get<Page<AbsenceRow>>('/attendance/absences', q, () =>
      pageOf(MOCK_ABSENCE.filter((r) => (!q['type'] || r.type === q['type']) && (!q['employee'] || r.name === q['employee']) && inRange(r.from, q)), +(q['page'] ?? 1), +(q['pageSize'] ?? 10)));
  }
  /** POST /attendance/absences (create) · PUT /attendance/absences/:id (update). The server recalculates `balance`. */
  saveAbsence(a: AbsenceRow, isNew: boolean) {
    return isNew
      ? this.api.post<AbsenceRow>('/attendance/absences', { ...a, id: undefined }, () => { const r = { ...a, id: Date.now() }; MOCK_ABSENCE.unshift(r); return r; })
      : this.api.put<AbsenceRow>(`/attendance/absences/${a.id}`, a, () => { const i = MOCK_ABSENCE.findIndex((x) => x.id === a.id); if (i >= 0) MOCK_ABSENCE[i] = { ...a }; return a; });
  }
  /** DELETE /attendance/absences/:id */
  deleteAbsence(id: number) {
    return this.api.delete(`/attendance/absences/${id}`, () => { const i = MOCK_ABSENCE.findIndex((x) => x.id === id); if (i >= 0) MOCK_ABSENCE.splice(i, 1); });
  }
  /** GET /attendance/leave-balances?department=&employee=&year= (annual balance per leave type) */
  leaveBalances(q: Query) {
    return this.api.get<LeaveBalanceRow[]>('/attendance/leave-balances', q, () =>
      MOCK_LEAVE_BALANCES.filter((r) => (!q['employee'] || r.name === q['employee']) && (!q['year'] || r.year === +q['year'])));
  }
  /** GET /attendance/penalties?... */
  penalties(q: Query) {
    return this.api.get<Page<PenaltyRow>>('/attendance/penalties', q, () =>
      pageOf(MOCK_PENALTIES.filter((r) => (!q['type'] || r.type === q['type']) && (!q['employee'] || r.name === q['employee']) && inRange(r.penaltyDate, q)), +(q['page'] ?? 1), +(q['pageSize'] ?? 10)));
  }
  /** POST /attendance/penalties (create, server returns the new id) · PUT /attendance/penalties/:id (update) */
  savePenalty(p: PenaltyRow, isNew: boolean) {
    return isNew
      ? this.api.post<PenaltyRow>('/attendance/penalties', { ...p, id: undefined }, () => { const r = { ...p, id: Date.now() }; MOCK_PENALTIES.unshift(r); return r; })
      : this.api.put<PenaltyRow>(`/attendance/penalties/${p.id}`, p, () => { const i = MOCK_PENALTIES.findIndex((x) => x.id === p.id); if (i >= 0) MOCK_PENALTIES[i] = { ...p }; return p; });
  }
  /** DELETE /attendance/penalties/:id */
  deletePenalty(id: number) {
    return this.api.delete(`/attendance/penalties/${id}`, () => { const i = MOCK_PENALTIES.findIndex((x) => x.id === id); if (i >= 0) MOCK_PENALTIES.splice(i, 1); });
  }
}
