import { CanDirective } from '../../core/auth/permissions';
import { ConfirmService } from '../../shared/ui/confirm';
import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api/api.service';
import { LookupsService } from '../../shared/data/lookups.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

interface Promotion { id: number; name: string; grade: string; gradeDate: string; updated: boolean; }
const MOCK: Promotion[] = [
  { id: 1, name: 'أحمد محمد علي', grade: 'الدرجة الأولى', gradeDate: '2024-07-01', updated: true },
  { id: 2, name: 'منى سعيد حسن', grade: 'الدرجة الثانية', gradeDate: '2023-07-01', updated: false },
  { id: 3, name: 'خالد إبراهيم محمود', grade: 'الدرجة الأولى', gradeDate: '2025-07-01', updated: false },
  { id: 4, name: 'سارة عبد الله يوسف', grade: 'الدرجة العليا', gradeDate: '2024-07-01', updated: true },
  { id: 5, name: 'محمود حسن سالم', grade: 'الدرجة الثالثة', gradeDate: '2022-07-01', updated: false },
];
const show = (d: string) => (d ? d.split('-').reverse().join('/') : '');

/** Screen 33 – كشوف الترقيات (/hr/promotions). API: GET/POST/PUT/DELETE /hr/promotions, POST /hr/promotions/apply. */
@Component({
  selector: 'app-promotions',
  imports: [CanDirective, PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="كشوف الترقيات" [breadcrumb]="[{ label: 'الموارد البشرية' }, { label: 'كشوف الترقيات' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] grid grid-cols-1 md:grid-cols-3 gap-3">
        <label class="flex flex-col gap-1"><span class="field-label">اسم الموظف</span>
          <select class="input" [ngModel]="fName()" (ngModelChange)="fName.set($event)"><option value="">الكل</option>@for (r of rows(); track r.id) { <option>{{ r.name }}</option> }</select></label>
        <label class="flex flex-col gap-1"><span class="field-label">الدرجة الوظيفية</span>
          <select class="input" [ngModel]="fGrade()" (ngModelChange)="fGrade.set($event)"><option value="">الكل</option>@for (g of grades; track g) { <option>{{ g }}</option> }</select></label>
        <label class="flex flex-col gap-1"><span class="field-label">تاريخ الدرجة</span>
          <input type="date" class="input !bg-[#dfe7f2]" [ngModel]="fDate()" (ngModelChange)="fDate.set($event)" /></label>
      </section>
      <section class="card">
        <div class="flex flex-wrap items-center justify-between gap-2 p-[13px]">
          <h2 class="font-bold text-navy">الموظفون المستحقون للترقية</h2>
          <div class="flex gap-2">
            <button *appCan="'hr.edit'" type="button" class="btn-primary" [disabled]="editing() !== null" (click)="add()"><app-icon name="plus" [size]="16" /> إضافة موظف</button>
            <button *appCan="'hr.edit'" type="button" class="btn-navy" (click)="apply()"><app-icon name="refresh" [size]="16" /> تحديث الترقيات</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr><th class="th">اسم الموظف</th><th class="th">الدرجة الوظيفية</th><th class="th">تاريخ الدرجة</th><th class="th text-center">تم التحديث</th><th class="th text-center">إجراءات</th></tr></thead>
            <tbody>
              @for (r of paged(); track r.id) {
                @if (editing() === r.id) {
                  <tr class="row-edit">
                    <td class="td"><select class="input-sm w-full" [(ngModel)]="d.name" aria-label="اسم الموظف"><option value="">اختر...</option>@for (e of lk()?.employees ?? []; track e) { <option>{{ e }}</option> }@if (d.name) { <option>{{ d.name }}</option> }</select></td>
                    <td class="td"><select class="input-sm w-full" [(ngModel)]="d.grade" aria-label="الدرجة">@for (g of grades; track g) { <option>{{ g }}</option> }</select></td>
                    <td class="td"><input type="date" class="input-sm w-full" [(ngModel)]="d.gradeDate" aria-label="تاريخ الدرجة" /></td>
                    <td class="td text-center"><input type="checkbox" class="checkbox" [checked]="d.updated" disabled aria-label="تم التحديث" /></td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-save" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td>
                  </tr>
                } @else {
                  <tr>
                    <td class="td text-gray-800">{{ r.name }}</td><td class="td">{{ r.grade }}</td><td class="td">{{ fmtDate(r.gradeDate) }}</td>
                    <td class="td text-center"><input type="checkbox" class="checkbox" [checked]="r.updated" disabled aria-label="تم التحديث" /></td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button *appCan="'hr.edit'" type="button" class="icon-btn-delete" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                      <button *appCan="'hr.edit'" type="button" class="icon-btn-edit" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                    </div></td>
                  </tr>
                }
              } @empty { <tr><td colspan="5" class="py-10 text-center text-sm text-gray-400">لا يوجد موظفون مطابقون</td></tr> }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between px-5 py-3 text-sm text-gray-500">
          <span>عرض {{ paged().length }} من {{ view().length }} ترقيات</span>
          <div class="flex items-center gap-2">
            <span>عدد السجلات في الصفحة</span>
            <select class="border border-gray-200 rounded-lg px-2 py-1" [ngModel]="size()" (ngModelChange)="size.set(+$event); page.set(1)">@for (s of [10, 25, 50]; track s) { <option [ngValue]="s">{{ s }}</option> }</select>
            <button type="button" class="icon-btn border-gray-200" [disabled]="page() <= 1" (click)="page.set(page() - 1)" aria-label="السابق">‹</button>
            <span class="icon-btn bg-navy border-navy text-white">{{ page() }}</span>
            <button type="button" class="icon-btn border-gray-200" [disabled]="page() * size() >= view().length" (click)="page.set(page() + 1)" aria-label="التالي">›</button>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class Promotions {
  private readonly dialog = inject(ConfirmService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected get grades() { return this.lk()?.grades ?? []; }
  protected readonly rows = signal<Promotion[]>([]);
  protected readonly fName = signal('');
  protected readonly fGrade = signal('');
  protected readonly fDate = signal('');
  protected readonly page = signal(1);
  protected readonly size = signal(10);
  protected readonly editing = signal<number | null>(null);
  protected readonly view = computed(() => this.rows().filter((r) => r.id === this.editing() ||
    ((!this.fName() || r.name === this.fName()) && (!this.fGrade() || r.grade === this.fGrade()) && (!this.fDate() || r.gradeDate === this.fDate()))));
  /** After a delete, never stay on a page that no longer exists. */
  private readonly clampPage = effect(() => { const max = Math.max(1, Math.ceil(this.view().length / this.size())); if (this.page() > max) this.page.set(max); });
  protected readonly paged = computed(() => this.view().slice((this.page() - 1) * this.size(), this.page() * this.size()));
  protected d = {} as Promotion;
  private isNew = false;
  protected fmtDate = show;

  constructor() { this.api.get<Promotion[]>('/hr/promotions', undefined, MOCK).subscribe((r) => this.rows.set(r)); }
  edit(r: Promotion) { this.isNew = false; this.d = { ...r }; this.editing.set(r.id); }
  add() {
    const r: Promotion = { id: -Date.now(), name: '', grade: this.grades[2] ?? '', gradeDate: '', updated: false };
    this.rows.update((rs) => [r, ...rs]); this.page.set(1); this.edit(r); this.isNew = true;
  }
  cancel() { if (this.isNew) this.rows.update((rs) => rs.filter((r) => r.id !== this.editing())); this.editing.set(null); }
  save() {
    if (!this.d.name || !this.d.gradeDate) { this.toast.error('برجاء إدخال الموظف وتاريخ الدرجة'); return; }
    const req = this.isNew ? this.api.post('/hr/promotions', this.d, this.d) : this.api.put(`/hr/promotions/${this.d.id}`, this.d, this.d);
    req.subscribe(() => { this.rows.update((rs) => rs.map((r) => (r.id === this.d.id ? { ...this.d } : r))); this.editing.set(null); this.toast.success('تم الحفظ'); });
  }
  async remove(r: Promotion) {
    if (!(await this.dialog.ask(`حذف ${r.name} من الكشف؟`))) return;
    this.api.delete(`/hr/promotions/${r.id}`).subscribe(() => { this.rows.update((rs) => rs.filter((x) => x.id !== r.id)); this.toast.success('تم الحذف'); });
  }
  apply() {
    this.api.post('/hr/promotions/apply', {}, {}).subscribe(() => {
      this.rows.update((rs) => rs.map((r) => ({ ...r, updated: true })));
      this.toast.success('تم تحديث الترقيات');
    });
  }
}
