import { CanDirective } from '../../core/auth/permissions';
import { ConfirmService } from '../../shared/ui/confirm';
import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../shared/data/attendance.service';
import { PenaltyRow, PenaltyType } from '../../shared/data/models';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { ToastService } from '../../shared/ui/toast';
import { exportCsv, printPage } from '../../shared/util/export';
import { ListState } from '../../shared/util/list-state';
import { AttendanceFilter, AttendanceFilters } from './attendance-filters';

const COLORS: Record<PenaltyType, string> = {
  'حرمان من مكافأة': 'bg-purple-50 text-purple-600', 'خصم مالي': 'bg-red-50 text-red-600',
  'إنذار': 'bg-yellow-50 text-yellow-700', 'خصم يوم': 'bg-orange-100 text-orange-600',
};

/** Screen 04 – الجزاءات والعقوبات (/attendance/penalties). */
@Component({
  selector: 'app-penalties-report',
  imports: [CanDirective, AppDatePipe, PageHeader, AttendanceFilters, Pagination, TableState, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="الجزاءات والعقوبات" [breadcrumb]="[{ label: 'الحضور والانصراف' }, { label: 'الجزاءات' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <app-attendance-filters typeLabel="نوع الجزاء" fromLabel="من تاريخ" toLabel="إلى تاريخ" exportLabel="تصدير" [navySearch]="true"
        [types]="types" (search)="onSearch($event)" (exportX)="export()" (print)="print()">
        <button *appCan="'hr.edit'" start type="button" class="btn-primary" [disabled]="editId() !== null" (click)="addNew()"><app-icon name="plus" [size]="16" /> إضافة جزاء</button>
      </app-attendance-filters>
      <section class="card">
        <p class="px-5 py-3 text-sm text-gray-600">إجمالي النتائج: <b class="text-navy">{{ list.total() }}</b> جزاء</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              <th class="th w-12">#</th><th class="th">اسم الموظف</th><th class="th text-center">نوع الجزاء</th><th class="th">تاريخ الجزاء</th>
              <th class="th text-center">عدد أيام الجزاء</th><th class="th">رقم قرار الجزاء</th><th class="th">تاريخ القرار</th><th class="th">السبب</th><th class="th text-center">إجراءات</th>
            </tr></thead>
            <tbody>
              @for (r of list.rows(); track r.id; let i = $index) {
                @if (editId() === r.id) {
                  <tr class="row-edit">
                    <td class="td text-gray-400">{{ i + 1 }}</td>
                    <td class="td"><input class="input-sm w-40" [(ngModel)]="draft.name" aria-label="اسم الموظف" /></td>
                    <td class="td"><select class="input-sm" [(ngModel)]="draft.type" aria-label="نوع الجزاء">@for (t of types; track t) { <option>{{ t }}</option> }</select></td>
                    <td class="td"><input type="date" class="input-sm w-36" [(ngModel)]="draft.penaltyDate" aria-label="تاريخ الجزاء" /></td>
                    <td class="td"><input class="input-sm w-16 text-center" type="number" min="0" step="1" [(ngModel)]="draft.days" aria-label="عدد الأيام" /></td>
                    <td class="td"><input class="input-sm w-28" [(ngModel)]="draft.decisionNo" aria-label="رقم القرار" /></td>
                    <td class="td"><input type="date" class="input-sm w-36" [(ngModel)]="draft.decisionDate" aria-label="تاريخ القرار" /></td>
                    <td class="td"><input class="input-sm w-40" [(ngModel)]="draft.reason" aria-label="السبب" /></td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-save" [disabled]="saving()" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td>
                  </tr>
                } @else {
                  <tr>
                    <td class="td text-gray-400">{{ (list.page() - 1) * list.pageSize() + i + 1 }}</td>
                    <td class="td font-semibold text-gray-800">{{ r.name }}</td>
                    <td class="td text-center"><span class="pill" [class]="colors[r.type]">{{ r.type }}</span></td>
                    <td class="td text-gray-500">{{ r.penaltyDate | appDate }}</td>
                    <td class="td text-center font-bold text-navy">{{ r.days || '—' }}</td>
                    <td class="td text-gray-600">{{ r.decisionNo }}</td>
                    <td class="td text-gray-500">{{ r.decisionDate | appDate }}</td>
                    <td class="td text-gray-500">{{ r.reason }}</td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <ng-container *appCan="'hr.edit'">
                      <button type="button" class="icon-btn-edit" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                      <button type="button" class="icon-btn-delete" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                      </ng-container>
                    </div></td>
                  </tr>
                }
              } @empty {
                <tr appTableState [cols]="9" [loading]="list.loading()" [error]="list.error()" (retry)="list.load()" emptyText="لا توجد جزاءات"></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="list.page()" (pageChange)="list.go($event)" [pageSize]="list.pageSize()" (pageSizeChange)="list.resize($event)" [total]="list.total()" />
      </section>
    </main>
  `,
})
export class PenaltiesReport {
  private readonly dialog = inject(ConfirmService);
  private readonly svc = inject(AttendanceService);
  private readonly toast = inject(ToastService);
  private filter: Partial<AttendanceFilter> = {};
  protected readonly types: PenaltyType[] = ['حرمان من مكافأة', 'خصم مالي', 'إنذار', 'خصم يوم'];
  protected readonly colors = COLORS;
  protected readonly list = new ListState<PenaltyRow>((page, pageSize) => this.svc.penalties({ ...this.filter, page, pageSize }));
  protected readonly editId = signal<number | null>(null);
  protected draft: PenaltyRow = {} as PenaltyRow;

  constructor() { this.list.load(); }
  onSearch(f: AttendanceFilter) { this.filter = f; this.list.search(); }
  edit(r: PenaltyRow) { this.draft = { ...r }; this.editId.set(r.id); }
  addNew() {
    const r: PenaltyRow = { id: -Date.now(), name: '', type: 'إنذار', penaltyDate: '', days: 0, decisionNo: '', decisionDate: '', reason: '' };
    this.list.rows.update((rs) => [r, ...rs]);
    this.edit(r);
  }
  /** New rows carry a temporary negative id until the server returns the real one. */
  private isTemp(id: number) { return id < 0; }
  protected readonly saving = signal(false);
  cancel() {
    const id = this.editId();
    if (id !== null && this.isTemp(id)) this.list.rows.update((rs) => rs.filter((r) => r.id !== id));
    this.editId.set(null);
  }
  private validate(d: PenaltyRow): string | null {
    if (!d.name.trim()) return 'برجاء إدخال اسم الموظف';
    if (!d.penaltyDate) return 'برجاء إدخال تاريخ الجزاء';
    if (!d.decisionNo.trim() || !d.decisionDate) return 'برجاء إدخال رقم وتاريخ قرار الجزاء';
    if (d.days < 0 || !Number.isInteger(+d.days)) return 'عدد أيام الجزاء غير صحيح';
    if (d.decisionDate > d.penaltyDate) return 'تاريخ القرار لا يمكن أن يكون بعد تاريخ الجزاء';
    return null;
  }
  save() {
    if (this.saving()) return;
    const d = { ...this.draft, days: +this.draft.days };
    const err = this.validate(d);
    if (err) { this.toast.error(err); return; }
    const tempId = d.id;
    this.saving.set(true);
    this.svc.savePenalty(d, this.isTemp(tempId)).subscribe({
      next: (saved) => {
        this.list.rows.update((rs) => rs.map((r) => (r.id === tempId ? saved : r)));
        this.editId.set(null);
        this.saving.set(false);
        this.toast.success('تم حفظ الجزاء');
      },
      error: () => this.saving.set(false),
    });
  }
  async remove(r: PenaltyRow) {
    if (!(await this.dialog.ask(`حذف جزاء ${r.name}؟`))) return;
    this.svc.deletePenalty(r.id).subscribe(() => { this.toast.success('تم الحذف'); this.list.afterDelete(); });
  }
  export() {
    exportCsv('الجزاءات', ['اسم الموظف', 'نوع الجزاء', 'تاريخ الجزاء', 'عدد الأيام', 'رقم القرار', 'تاريخ القرار', 'السبب'],
      this.list.rows().map((r) => [r.name, r.type, r.penaltyDate, r.days, r.decisionNo, r.decisionDate, r.reason]));
  }
  print() { printPage(); }
}
