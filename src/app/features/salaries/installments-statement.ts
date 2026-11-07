import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CanDirective } from '../../core/auth/permissions';
import { InstallmentPlan, InstallmentsService } from '../../shared/data/installments.service';
import { LookupsService } from '../../shared/data/lookups.service';
import { ConfirmService } from '../../shared/ui/confirm';
import { SelectField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { ToastService } from '../../shared/ui/toast';
import { AppDatePipe } from '../../shared/util/date.pipe';
import { exportCsv, printPage } from '../../shared/util/export';
import { ListState } from '../../shared/util/list-state';
import { fmt } from '../../shared/util/num';

/** Screen 10 – بيان الأقساط (/salaries/installments): filters, totals, inline add/edit, cancel, details. */
@Component({
  selector: 'app-installments-statement',
  imports: [AppDatePipe, PageHeader, SelectField, Icon, Pagination, TableState, FormsModule, RouterLink, CanDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="بيان الأقساط" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'بيان الأقساط' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] no-print">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <app-select-field label="نوع القسط" placeholder="جميع أنواع الأقساط" [options]="types() ?? []" [(value)]="type" />
          <app-select-field label="الإدارة" placeholder="جميع الإدارات" [options]="lk()?.departments ?? []" [(value)]="department" />
          <app-select-field label="مركز التكلفة" placeholder="جميع المراكز" [options]="lk()?.costCenters ?? []" [(value)]="costCenter" />
          <app-select-field label="اسم الموظف" placeholder="جميع الموظفين" [options]="lk()?.employees ?? []" [(value)]="employee" />
          <label class="flex flex-col gap-1.5 text-sm text-gray-600 font-medium">تاريخ بداية القسط من
            <input id="inst-from" type="date" class="input" [ngModel]="from()" (ngModelChange)="from.set($event)" /></label>
          <label class="flex flex-col gap-1.5 text-sm text-gray-600 font-medium">تاريخ بداية القسط إلى
            <input id="inst-to" type="date" class="input" [ngModel]="to()" (ngModelChange)="to.set($event)" /></label>
        </div>
        <div class="flex flex-wrap gap-5 mt-4 text-sm text-gray-700">
          <label class="flex items-center gap-2 cursor-pointer"><input id="inst-cancelled" type="checkbox" class="checkbox" [ngModel]="onlyCancelled()" (ngModelChange)="onlyCancelled.set($event)" /> أقساط ملغية</label>
          <label class="flex items-center gap-2 cursor-pointer"><input id="inst-finished" type="checkbox" class="checkbox" [ngModel]="onlyFinished()" (ngModelChange)="onlyFinished.set($event)" /> أقساط منتهية</label>
        </div>
        <div class="flex flex-wrap justify-between gap-2 mt-4">
          <div class="flex gap-2">
            <button type="button" class="btn-primary" (click)="search()"><app-icon name="search" [size]="16" /> بحث</button>
            <button type="button" class="btn-outline" (click)="reset()"><app-icon name="refresh" [size]="16" /> مسح الفلاتر</button>
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn-outline" (click)="export()"><app-icon name="file" [size]="16" /> تصدير</button>
            <button type="button" class="btn-outline" (click)="print()"><app-icon name="print" [size]="16" /> طباعة</button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm text-gray-600 border-b border-gray-100">
          <span>إجمالي النتائج: <b class="text-brand">{{ list.total() }}</b> قسط</span>
          <div class="flex flex-wrap gap-x-5 gap-y-1">
            <span>إجمالي القيمة: <b class="text-brand">{{ money(summary().total) }} ج.م</b></span>
            <span>المسدد: <b class="text-brand">{{ money(summary().paid) }} ج.م</b></span>
            <span>المتبقي: <b class="text-brand">{{ money(summary().remaining) }} ج.م</b></span>
          </div>
          <button *appCan="'salaries.edit'" type="button" class="btn-primary no-print" [disabled]="editId() !== null" (click)="addNew()"><app-icon name="plus" [size]="16" /> إضافة قسط</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table compact">
            <thead class="table-head"><tr>
              <th class="th">اسم الموظف</th><th class="th">نوع القسط</th><th class="th">إجمالي قيمة القسط</th><th class="th text-center">عدد الأقساط</th>
              <th class="th">تاريخ بداية القسط</th><th class="th">إجمالي المسدد</th><th class="th text-center">إجمالي المتبقي</th><th class="th">ملاحظات</th>
              <th class="th text-center">إلغاء القسط</th><th class="th text-center">تفاصيل القسط</th><th class="th text-center w-28 no-print">إجراءات</th>
            </tr></thead>
            <tbody>
              @for (r of list.rows(); track r.id) {
                @if (editId() === r.id) {
                  <tr class="row-edit">
                    <td class="td">
                      @if (isNew(r.id)) {
                        <select class="input-sm min-w-40" [(ngModel)]="draft.employee" aria-label="اسم الموظف">
                          <option value="">اختر الموظف...</option>
                          @for (n of lk()?.employees ?? []; track n) { <option>{{ n }}</option> }
                        </select>
                      } @else { <span class="font-bold text-gray-800">{{ r.employee }}</span> }
                    </td>
                    <td class="td"><select class="input-sm min-w-36" [(ngModel)]="draft.type" aria-label="نوع القسط">@for (t of types() ?? []; track t) { <option>{{ t }}</option> }</select></td>
                    <td class="td"><input class="input-sm w-28" type="number" min="1" step="0.01" [(ngModel)]="draft.total" aria-label="إجمالي قيمة القسط" /></td>
                    <td class="td text-center"><input class="input-sm w-16 text-center" type="number" min="1" step="1" [(ngModel)]="draft.count" aria-label="عدد الأقساط" /></td>
                    <td class="td"><input class="input-sm w-36" type="date" [(ngModel)]="draft.start" aria-label="تاريخ بداية القسط" /></td>
                    <td class="td text-gray-500">{{ money(r.paid) }}</td>
                    <td class="td text-center text-gray-500">{{ money(r.remaining) }}</td>
                    <td class="td"><input class="input-sm w-32" [(ngModel)]="draft.notes" placeholder="ملاحظات" aria-label="ملاحظات" /></td>
                    <td class="td text-center"><input type="checkbox" class="checkbox" [checked]="r.cancelled" disabled aria-label="إلغاء القسط" /></td>
                    <td class="td text-center">—</td>
                    <td class="td no-print"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-save" [disabled]="saving()" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td>
                  </tr>
                } @else {
                  <tr [class.opacity-60]="r.cancelled">
                    <td class="td font-bold text-gray-800">{{ r.employee }}</td>
                    <td class="td text-gray-600">{{ r.type }}</td>
                    <td class="td font-bold text-navy">{{ money(r.total) }}</td>
                    <td class="td text-center text-gray-700">{{ r.count }}</td>
                    <td class="td text-gray-500">{{ r.start | appDate }}</td>
                    <td class="td text-gray-700">{{ money(r.paid) }}</td>
                    <td class="td text-center">
                      @if (r.remaining <= 0) { <span class="pill bg-green-50 text-green-600 font-bold">0.00</span> }
                      @else { <span class="font-bold text-brand">{{ money(r.remaining) }}</span> }
                    </td>
                    <td class="td text-gray-500">{{ r.notes || '—' }}</td>
                    <td class="td text-center">
                      <input type="checkbox" class="checkbox" [checked]="r.cancelled" [disabled]="!canEdit || editId() !== null" (click)="toggleCancel(r, $event)"
                        [attr.aria-label]="(r.cancelled ? 'استرجاع قسط ' : 'إلغاء قسط ') + r.employee" />
                    </td>
                    <td class="td text-center">
                      <a [routerLink]="['/salaries/installments', r.id]" class="icon-btn border-orange-300 text-brand hover:bg-orange-50 mx-auto" [attr.aria-label]="'تفاصيل قسط ' + r.employee" title="تفاصيل القسط"><app-icon name="list" [size]="16" /></a>
                    </td>
                    <td class="td no-print"><div class="flex justify-center gap-2">
                      <ng-container *appCan="'salaries.edit'">
                        <button type="button" class="icon-btn-edit" [disabled]="editId() !== null || r.cancelled" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                        <button type="button" class="icon-btn-delete" [disabled]="editId() !== null" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                      </ng-container>
                    </div></td>
                  </tr>
                }
              } @empty {
                <tr appTableState [cols]="11" [loading]="list.loading()" [error]="list.error()" (retry)="list.load()" emptyText="لا توجد أقساط"></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="list.page()" (pageChange)="list.go($event)" [pageSize]="list.pageSize()" (pageSizeChange)="list.resize($event)" [total]="list.total()" />
      </section>
    </main>
  `,
  styles: `.compact :is(th, td) { padding-inline: 10px; } .compact th { white-space: normal; line-height: 1.3; vertical-align: middle; }`,
})
export class InstallmentsStatement {
  private readonly svc = inject(InstallmentsService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(ConfirmService);
  protected readonly canEdit = inject(AuthService).can('salaries.edit');
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly types = toSignal(this.svc.types());
  protected readonly type = signal('');
  protected readonly department = signal('');
  protected readonly costCenter = signal('');
  protected readonly employee = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly onlyCancelled = signal(false);
  protected readonly onlyFinished = signal(false);
  protected readonly summary = signal({ total: 0, paid: 0, remaining: 0 });
  protected readonly money = (n: number) => fmt(n, 2);

  protected readonly list = new ListState<InstallmentPlan>((page, pageSize) => this.svc.list({
    type: this.type(), department: this.department(), costCenter: this.costCenter(), employee: this.employee(),
    from: this.from(), to: this.to(), cancelled: this.onlyCancelled() ? 'true' : '', finished: this.onlyFinished() ? 'true' : '', page, pageSize,
  }).pipe(tap((r) => this.summary.set(r.summary))));

  protected readonly editId = signal<number | null>(null);
  protected draft = {} as InstallmentPlan;
  protected readonly saving = signal(false);

  constructor() { this.list.load(); }
  protected isNew(id: number) { return id < 0; }
  search() {
    if (this.from() && this.to() && this.to() < this.from()) { this.toast.error('تاريخ «إلى» قبل تاريخ «من»'); return; }
    this.editId.set(null); this.list.search();
  }
  reset() {
    this.type.set(''); this.department.set(''); this.costCenter.set(''); this.employee.set('');
    this.from.set(''); this.to.set(''); this.onlyCancelled.set(false); this.onlyFinished.set(false); this.search();
  }

  addNew() {
    const r: InstallmentPlan = { id: -Date.now(), employee: '', department: '', costCenter: '', type: this.types()?.[0] ?? '', total: 0, count: 12, start: new Date().toISOString().slice(0, 10), paid: 0, remaining: 0, notes: '', cancelled: false };
    this.list.rows.update((rs) => [r, ...rs]);
    this.edit(r);
  }
  edit(r: InstallmentPlan) { this.draft = { ...r }; this.editId.set(r.id); }
  cancel() {
    const id = this.editId();
    if (id !== null && this.isNew(id)) this.list.rows.update((rs) => rs.filter((r) => r.id !== id));
    this.editId.set(null);
  }
  save() {
    if (this.saving()) return;
    const d: InstallmentPlan = { ...this.draft, total: +this.draft.total, count: +this.draft.count };
    if (!d.employee) { this.toast.error('برجاء اختيار الموظف'); return; }
    if (!d.type) { this.toast.error('برجاء اختيار نوع القسط'); return; }
    if (!(d.total > 0)) { this.toast.error('إجمالي قيمة القسط لازم يكون أكبر من صفر'); return; }
    if (!(d.count >= 1) || !Number.isInteger(d.count)) { this.toast.error('عدد الأقساط لازم يكون رقم صحيح'); return; }
    if (!d.start) { this.toast.error('برجاء إدخال تاريخ بداية القسط'); return; }
    if (d.total < d.paid) { this.toast.error('إجمالي القيمة أقل من المسدد فعلاً'); return; }
    const isNew = this.isNew(d.id);
    if (isNew) { const e = this.lk(); d.department = d.department || (e?.departments?.[0] ?? ''); d.costCenter = d.costCenter || (e?.costCenters?.[0] ?? ''); }
    const tempId = d.id;
    this.saving.set(true);
    this.svc.save(d, isNew).subscribe({
      next: (saved) => {
        this.list.rows.update((rs) => rs.map((r) => (r.id === tempId ? saved : r)));
        this.editId.set(null); this.saving.set(false);
        this.toast.success(isNew ? 'تمت إضافة القسط' : 'تم حفظ القسط');
        this.refreshSummary();
      },
      error: () => this.saving.set(false),
    });
  }
  async toggleCancel(r: InstallmentPlan, e: Event) {
    e.preventDefault(); // the checkbox only changes after the server accepts it
    const to = !r.cancelled;
    const ok = await this.dialog.ask(to
      ? { title: 'إلغاء القسط', message: `إلغاء قسط ${r.type} للموظف ${r.employee}؟ الأقساط الباقية مش هتتخصم.`, confirmText: 'إلغاء القسط', danger: true }
      : { title: 'استرجاع القسط', message: `استرجاع قسط ${r.type} للموظف ${r.employee}؟`, confirmText: 'استرجاع' });
    if (!ok) return;
    this.svc.setCancelled(r, to).subscribe((saved) => {
      this.list.rows.update((rs) => rs.map((x) => (x.id === r.id ? saved : x)));
      this.toast.success(to ? 'تم إلغاء القسط' : 'تم استرجاع القسط');
      this.refreshSummary();
    });
  }
  async remove(r: InstallmentPlan) {
    if (!(await this.dialog.ask(`حذف قسط ${r.type} للموظف ${r.employee}؟`))) return;
    this.svc.remove(r.id).subscribe(() => { this.toast.success('تم الحذف'); this.list.afterDelete(); });
  }
  private refreshSummary() { this.list.load(); }

  export() {
    exportCsv('بيان-الأقساط', ['اسم الموظف', 'نوع القسط', 'إجمالي قيمة القسط', 'عدد الأقساط', 'تاريخ البداية', 'المسدد', 'المتبقي', 'ملاحظات', 'ملغي'],
      this.list.rows().map((r) => [r.employee, r.type, r.total, r.count, r.start, r.paid, r.remaining, r.notes, r.cancelled ? 'نعم' : '']));
  }
  print() { printPage(); }
}
