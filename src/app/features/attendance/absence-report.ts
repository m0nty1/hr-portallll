import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { CanDirective } from '../../core/auth/permissions';
import { LookupsService } from '../../shared/data/lookups.service';
import { ConfirmService } from '../../shared/ui/confirm';
import { SelectField } from '../../shared/ui/fields';
import { Icon, IconName } from '../../shared/ui/icon';
import { ToastService } from '../../shared/ui/toast';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../shared/data/attendance.service';
import { AbsenceRow, LeaveBalanceRow, LeaveType } from '../../shared/data/models';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { exportCsv, printPage } from '../../shared/util/export';
import { ListState } from '../../shared/util/list-state';
import { AttendanceFilter, AttendanceFilters } from './attendance-filters';

export const LEAVE_COLORS: Record<LeaveType, string> = {
  'اعتيادي': 'bg-blue-50 text-blue-600', 'مرضي': 'bg-green-50 text-green-600',
  'عارضة': 'bg-orange-100 text-orange-600', 'مأمورية': 'bg-purple-50 text-purple-600',
};

/** Screen 03 – كشف الغياب والإجازات (/attendance/absence): monthly leaves + annual balance tabs. */
@Component({
  selector: 'app-absence-report',
  imports: [CanDirective, AppDatePipe, PageHeader, AttendanceFilters, Pagination, TableState, FormsModule, Icon, SelectField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="كشف الغياب والإجازات" [breadcrumb]="[{ label: 'الحضور والانصراف' }, { label: 'كشف الغياب' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <nav class="card flex px-4" role="tablist">
        @for (t of tabs; track t.key) {
          <button type="button" role="tab" [attr.aria-selected]="tab() === t.key" (click)="tab.set(t.key)"
            class="flex items-center gap-2 px-5 h-12 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors"
            [class]="tab() === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-navy'">
            <app-icon [name]="t.icon" [size]="16" />{{ t.label }}
          </button>
        }
      </nav>

      @if (tab() === 'monthly') {
        <app-attendance-filters typeLabel="نوع الإجازة" [types]="types" (search)="onSearch($event)" (exportX)="export()" (print)="print()" />
        <section class="card">
          <div class="flex items-center justify-between gap-3 px-5 py-3">
            <h2 class="font-bold text-navy">سجل الإجازات الشهرية</h2>
            <button *appCan="'hr.edit'" type="button" class="btn-primary" [disabled]="editId() !== null" (click)="addNew()"><app-icon name="plus" [size]="16" /> إضافة إجازة</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm zebra-table">
              <thead class="table-head"><tr>
                <th class="th w-12">#</th><th class="th">اسم الموظف</th><th class="th text-center">نوع الإجازة</th>
                <th class="th text-center">عدد الأيام</th><th class="th">الفترة من</th><th class="th">الفترة إلى</th>
                <th class="th text-center">رصيد الإجازات المتبقي</th><th class="th text-center w-28">إجراءات</th>
              </tr></thead>
              <tbody>
                @for (r of list.rows(); track r.id; let i = $index) {
                  @if (editId() === r.id) {
                    <tr class="row-edit">
                      <td class="td text-gray-400">{{ (list.page() - 1) * list.pageSize() + i + 1 }}</td>
                      <td class="td">
                        <select class="input-sm min-w-40" [(ngModel)]="draft.name" aria-label="اسم الموظف">
                          <option value="">اختر الموظف...</option>
                          @for (n of employees(); track n) { <option>{{ n }}</option> }
                        </select>
                      </td>
                      <td class="td text-center"><select class="input-sm" [(ngModel)]="draft.type" aria-label="نوع الإجازة">@for (t of types; track t) { <option>{{ t }}</option> }</select></td>
                      <td class="td text-center"><input class="input-sm w-16 text-center" type="number" min="1" step="1" [(ngModel)]="draft.days" aria-label="عدد الأيام" /></td>
                      <td class="td"><input type="date" class="input-sm w-36" [(ngModel)]="draft.from" (ngModelChange)="syncDays()" aria-label="الفترة من" /></td>
                      <td class="td"><input type="date" class="input-sm w-36" [(ngModel)]="draft.to" (ngModelChange)="syncDays()" aria-label="الفترة إلى" /></td>
                      <td class="td text-center text-gray-400">{{ r.balance ?? '—' }}</td>
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
                      <td class="td text-center font-bold text-navy">{{ r.days }}</td>
                      <td class="td text-gray-500">{{ r.from | appDate }}</td>
                      <td class="td text-gray-500">{{ r.to | appDate }}</td>
                      <td class="td text-center">
                        @if (r.balance === 0) { <span class="pill bg-red-50 text-red-600 font-bold">0</span> }
                        @else { <span class="font-bold text-navy">{{ r.balance ?? '—' }}</span> }
                      </td>
                      <td class="td"><div class="flex justify-center gap-2">
                        <ng-container *appCan="'hr.edit'">
                          <button type="button" class="icon-btn-edit" [disabled]="editId() !== null" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                          <button type="button" class="icon-btn-delete" [disabled]="editId() !== null" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                        </ng-container>
                      </div></td>
                    </tr>
                  }
                } @empty {
                  <tr appTableState [cols]="8" [loading]="list.loading()" [error]="list.error()" (retry)="list.load()" emptyText="لا توجد إجازات في الفترة المحددة"></tr>
                }
              </tbody>
            </table>
          </div>
          <app-pagination [page]="list.page()" (pageChange)="list.go($event)" [pageSize]="list.pageSize()" (pageSizeChange)="list.resize($event)" [total]="list.total()" />
        </section>
      } @else {
        <section class="card p-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <app-select-field label="الإدارة" placeholder="جميع الإدارات" [options]="departments()" [(value)]="bDept" />
            <app-select-field label="اسم الموظف" placeholder="جميع الموظفين" [options]="employees()" [(value)]="bEmp" />
            <app-select-field label="العام الميلادي" [options]="years" [(value)]="bYear" />
          </div>
          <div class="flex gap-3 mt-4">
            <button type="button" class="btn-primary" (click)="loadBalances()"><app-icon name="search" [size]="16" /> بحث</button>
            <button type="button" class="btn-outline" (click)="clearBalances()"><app-icon name="refresh" [size]="16" /> مسح</button>
          </div>
        </section>
        <section class="card">
          <div class="overflow-x-auto">
            <table class="w-full text-sm zebra-table">
              <thead class="table-head"><tr>
                <th class="th">اسم الموظف</th><th class="th text-center">العام الميلادي</th>
                @for (b of buckets; track b.key) {
                  <th class="th text-center">الرصيد السنوي {{ b.of }}</th><th class="th text-center">إجمالي {{ b.label }} السنوي</th><th class="th text-center">المتبقي من {{ b.label }}</th>
                }
              </tr></thead>
              <tbody>
                @for (r of balances(); track r.name + r.year) {
                  <tr>
                    <td class="td font-semibold text-gray-800 whitespace-nowrap">{{ r.name }}</td>
                    <td class="td text-center font-bold text-navy">{{ r.year }}</td>
                    @for (b of buckets; track b.key) {
                      <td class="td text-center text-gray-600">{{ r[b.key].annual }}</td>
                      <td class="td text-center text-gray-600">{{ r[b.key].used }}</td>
                      <td class="td text-center">
                        @if (r[b.key].left <= 0) { <span class="pill bg-red-50 text-red-600 font-bold">{{ r[b.key].left }}</span> }
                        @else { <span class="font-bold text-navy">{{ r[b.key].left }}</span> }
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr><td class="td text-center text-gray-400 py-10" colspan="11">{{ balancesLoading() ? 'جاري التحميل...' : 'لا توجد بيانات' }}</td></tr>
                }
              </tbody>
            </table>
          </div>
          <p class="px-5 py-3 text-sm text-gray-500">عرض {{ balances().length }} موظف</p>
        </section>
      }
    </main>
  `,
})
export class AbsenceReport {
  private readonly dialog = inject(ConfirmService);
  private readonly svc = inject(AttendanceService);
  private readonly toast = inject(ToastService);
  private readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly employees = () => this.lk()?.employees ?? [];
  protected readonly departments = () => this.lk()?.departments ?? [];

  protected readonly tabs: { key: 'monthly' | 'annual'; label: string; icon: IconName }[] = [
    { key: 'monthly', label: 'الإجازات الشهرية', icon: 'calendar' },
    { key: 'annual', label: 'الرصيد السنوي للإجازات', icon: 'scale' },
  ];
  protected readonly tab = signal<'monthly' | 'annual'>('monthly');

  // ── Monthly leaves
  private filter: Partial<AttendanceFilter> = {};
  protected readonly types: LeaveType[] = ['اعتيادي', 'مرضي', 'عارضة', 'مأمورية'];
  protected readonly colors = LEAVE_COLORS;
  protected readonly list = new ListState<AbsenceRow>((page, pageSize) => this.svc.absences({ ...this.filter, page, pageSize }));
  protected readonly editId = signal<number | null>(null);
  protected draft = {} as AbsenceRow;
  protected readonly saving = signal(false);

  constructor() {
    this.list.load();
    effect(() => { if (this.tab() === 'annual') untracked(() => this.loadBalances()); });
  }
  onSearch(f: AttendanceFilter) { this.filter = f; this.list.search(); }
  edit(r: AbsenceRow) { this.draft = { ...r }; this.editId.set(r.id); }
  addNew() {
    const r: AbsenceRow = { id: -Date.now(), name: '', type: 'اعتيادي', days: 1, from: '', to: '', balance: null };
    this.list.rows.update((rs) => [r, ...rs]);
    this.edit(r);
  }
  private isTemp(id: number) { return id < 0; }
  cancel() {
    const id = this.editId();
    if (id !== null && this.isTemp(id)) this.list.rows.update((rs) => rs.filter((r) => r.id !== id));
    this.editId.set(null);
  }
  /** Fills the day count from the two dates (still editable). */
  syncDays() {
    const { from, to } = this.draft;
    if (from && to && to >= from) this.draft.days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;
  }
  private validate(d: AbsenceRow): string | null {
    if (!d.name) return 'برجاء اختيار الموظف';
    if (!d.from || !d.to) return 'برجاء إدخال الفترة من وإلى';
    if (d.to < d.from) return 'تاريخ النهاية قبل تاريخ البداية';
    if (!(d.days >= 1) || !Number.isInteger(+d.days)) return 'عدد الأيام غير صحيح';
    return null;
  }
  save() {
    if (this.saving()) return;
    const d = { ...this.draft, days: +this.draft.days };
    const err = this.validate(d);
    if (err) { this.toast.error(err); return; }
    const tempId = d.id;
    this.saving.set(true);
    this.svc.saveAbsence(d, this.isTemp(tempId)).subscribe({
      next: (saved) => {
        this.list.rows.update((rs) => rs.map((r) => (r.id === tempId ? saved : r)));
        this.editId.set(null); this.saving.set(false); this.toast.success('تم حفظ الإجازة');
      },
      error: () => this.saving.set(false),
    });
  }
  async remove(r: AbsenceRow) {
    if (!(await this.dialog.ask(`حذف إجازة ${r.name}؟`))) return;
    this.svc.deleteAbsence(r.id).subscribe(() => { this.toast.success('تم الحذف'); this.list.afterDelete(); });
  }
  export() {
    exportCsv('كشف-الغياب', ['اسم الموظف', 'نوع الإجازة', 'عدد الأيام', 'من', 'إلى', 'الرصيد المتبقي'],
      this.list.rows().map((r) => [r.name, r.type, r.days, r.from, r.to, r.balance ?? '']));
  }
  print() { printPage(); }

  // ── Annual balance
  protected readonly buckets: { key: 'regular' | 'casual' | 'sick'; label: string; of: string }[] = [
    { key: 'regular', label: 'الاعتيادي', of: 'للاعتيادي' }, { key: 'casual', label: 'العارضة', of: 'للعارضة' }, { key: 'sick', label: 'المرضي', of: 'للمرضي' },
  ];
  protected readonly years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));
  protected bDept = '';
  protected bEmp = '';
  protected bYear = this.years[0];
  protected readonly balances = signal<LeaveBalanceRow[]>([]);
  protected readonly balancesLoading = signal(false);
  private balSub?: Subscription;
  loadBalances() {
    this.balSub?.unsubscribe();
    this.balancesLoading.set(true);
    this.balSub = this.svc.leaveBalances({ department: this.bDept, employee: this.bEmp, year: this.bYear }).subscribe({
      next: (r) => { this.balances.set(r); this.balancesLoading.set(false); },
      error: () => this.balancesLoading.set(false),
    });
  }
  clearBalances() { this.bDept = ''; this.bEmp = ''; this.bYear = this.years[0]; this.loadBalances(); }
}
