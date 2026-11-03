import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../shared/data/attendance.service';
import { AbsenceRow, LeaveType } from '../../shared/data/models';
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

/** Screen 03 – كشف الغياب والإجازات (/attendance/absence). */
@Component({
  selector: 'app-absence-report',
  imports: [AppDatePipe, PageHeader, AttendanceFilters, Pagination, TableState, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="كشف الغياب والإجازات" [breadcrumb]="[{ label: 'الحضور والانصراف' }, { label: 'كشف الغياب' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <app-attendance-filters typeLabel="نوع الإجازة" [types]="types" (search)="onSearch($event)" (exportX)="export()" (print)="print()" />
      <section class="card">
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              <th class="th w-12">#</th><th class="th">اسم الموظف</th><th class="th text-center">نوع الإجازة</th>
              <th class="th text-center">عدد الأيام</th><th class="th">الفترة من</th><th class="th">الفترة إلى</th>
              <th class="th w-12 text-center"><input type="checkbox" class="checkbox" aria-label="تحديد الكل" [ngModel]="allChecked()" (ngModelChange)="toggleAll($event)" /></th>
            </tr></thead>
            <tbody>
              @for (r of list.rows(); track r.id; let i = $index) {
                <tr>
                  <td class="td text-gray-400">{{ (list.page() - 1) * list.pageSize() + i + 1 }}</td>
                  <td class="td font-semibold text-gray-800">{{ r.name }}</td>
                  <td class="td text-center"><span class="pill" [class]="colors[r.type]">{{ r.type }}</span></td>
                  <td class="td text-center font-bold text-navy">{{ r.days }}</td>
                  <td class="td text-gray-500">{{ r.from | appDate }}</td>
                  <td class="td text-gray-500">{{ r.to | appDate }}</td>
                  <td class="td text-center"><input type="checkbox" class="checkbox" [attr.aria-label]="'تحديد ' + r.name" [ngModel]="checked().has(r.id)" (ngModelChange)="toggle(r.id)" /></td>
                </tr>
              } @empty {
                <tr appTableState [cols]="7" [loading]="list.loading()" [error]="list.error()" (retry)="list.load()" emptyText="لا توجد إجازات في الفترة المحددة"></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="list.page()" (pageChange)="list.go($event)" [pageSize]="list.pageSize()" (pageSizeChange)="list.resize($event)" [total]="list.total()" />
      </section>
    </main>
  `,
})
export class AbsenceReport {
  private readonly svc = inject(AttendanceService);
  private filter: Partial<AttendanceFilter> = {};
  protected readonly types: LeaveType[] = ['اعتيادي', 'مرضي', 'عارضة', 'مأمورية'];
  protected readonly colors = LEAVE_COLORS;
  protected readonly list = new ListState<AbsenceRow>((page, pageSize) => this.svc.absences({ ...this.filter, page, pageSize }));
  protected readonly checked = signal(new Set<number>());
  protected readonly allChecked = () => this.list.rows().length > 0 && this.list.rows().every((r) => this.checked().has(r.id));

  constructor() { this.list.load(); }
  onSearch(f: AttendanceFilter) { this.filter = f; this.list.search(); }
  toggle(id: number) { this.checked.update((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  toggleAll(on: boolean) { this.checked.set(on ? new Set(this.list.rows().map((r) => r.id)) : new Set()); }
  export() {
    exportCsv('كشف-الغياب', ['اسم الموظف', 'نوع الإجازة', 'عدد الأيام', 'من', 'إلى'],
      this.list.rows().map((r) => [r.name, r.type, r.days, r.from, r.to]));
  }
  print() { printPage(); }
}
