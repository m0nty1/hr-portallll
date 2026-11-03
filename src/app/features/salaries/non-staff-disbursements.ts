import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LookupsService } from '../../shared/data/lookups.service';
import { NonStaffDisbursement } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { SelectField, TextField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { exportCsv, printPage } from '../../shared/util/export';
import { ListState } from '../../shared/util/list-state';
import { fmt, num } from '../../shared/util/num';

export const DISB_TYPE_COLORS: Partial<Record<string, string>> = { 'حوافز إنتاج': 'bg-blue-50 text-blue-600', 'مكافأة أداء': 'bg-blue-50 text-blue-600', 'بدل طبيعة عمل': 'bg-blue-50 text-navy' };

/** Screen 19a – صرفيات غير العاملين (/salaries/non-staff). */
@Component({
  selector: 'app-non-staff-disbursements',
  imports: [AppDatePipe, PageHeader, SelectField, TextField, Icon, Pagination, TableState, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="صرفيات غير العاملين" [breadcrumb]="[{ label: 'المرتبات والحوافز' }, { label: 'صرفيات غير العاملين' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] no-print">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <app-select-field label="نوع الصرفية" placeholder="** جميع أنواع الصرفيات **" [options]="lk()?.disbursementTypes ?? []" [(value)]="type" />
          <app-select-field label="الإدارة" placeholder="** جميع الإدارات **" [options]="lk()?.departments ?? []" [(value)]="department" />
          <app-text-field label="ملاحظات" placeholder="ابحث في الملاحظات..." [(value)]="notes" />
          <app-text-field label="تاريخ الصرفية من" kind="date" [(value)]="from" />
          <app-text-field label="تاريخ الصرفية إلى" kind="date" [(value)]="to" />
        </div>
        <div class="flex flex-wrap justify-between gap-2 mt-4">
          <div class="flex gap-2">
            <button type="button" class="btn-primary" (click)="list.search()"><app-icon name="search" [size]="16" /> بحث</button>
            <button type="button" class="btn-outline" (click)="reset()"><app-icon name="refresh" [size]="16" /> مسح الفلاتر</button>
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn-outline" (click)="export()"><app-icon name="file" [size]="16" /> تصدير</button>
            <button type="button" class="btn-outline" (click)="print()"><app-icon name="print" [size]="16" /> طباعة</button>
          </div>
        </div>
      </section>
      <section class="card">
        <div class="flex justify-between px-5 py-3 text-sm text-gray-600">
          <span>إجمالي النتائج: <b class="text-brand">{{ list.total() }}</b> صرفية</span>
          <span>إجمالي المبالغ: <b class="text-brand">{{ sum() }} ج.م</b></span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              <th class="th w-10">#</th><th class="th text-center">نوع الصرفية</th><th class="th">الإدارة</th><th class="th">تاريخ الصرفية</th>
              <th class="th text-center">عدد الموظفين</th><th class="th">إجمالي الصرفية</th><th class="th">ملاحظات</th><th class="th text-center">التفاصيل</th>
            </tr></thead>
            <tbody>
              @for (r of list.rows(); track r.id; let i = $index) {
                <tr>
                  <td class="td text-gray-400">{{ i + 1 }}</td>
                  <td class="td text-center"><span class="pill" [class]="colors[r.type] || 'bg-blue-50 text-blue-600'">{{ r.type }}</span></td>
                  <td class="td text-gray-700">{{ r.dept }}</td>
                  <td class="td text-gray-500">{{ r.date | appDate }}</td>
                  <td class="td text-center font-bold text-gray-700">{{ r.employees }}</td>
                  <td class="td font-bold text-brand">{{ r.total }} ج.م</td>
                  <td class="td text-gray-400">{{ r.notes }}</td>
                  <td class="td text-center">
                    <a [routerLink]="['/salaries/non-staff', r.id]" class="inline-flex items-center gap-1.5 border border-brand text-brand rounded-lg px-3 py-1 text-xs hover:bg-orange-50"><app-icon name="eye" [size]="14" /> عرض التفاصيل</a>
                  </td>
                </tr>
              } @empty {
                <tr appTableState [cols]="8" [loading]="list.loading()" [error]="list.error()" (retry)="list.load()" emptyText="لا توجد صرفيات"></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="list.page()" (pageChange)="list.go($event)" [pageSize]="list.pageSize()" (pageSizeChange)="list.resize($event)" [total]="list.total()" />
      </section>
    </main>
  `,
})
export class NonStaffDisbursements {
  private readonly svc = inject(SalariesService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly colors = DISB_TYPE_COLORS;
  protected readonly type = signal('');
  protected readonly department = signal('');
  protected readonly notes = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly list = new ListState<NonStaffDisbursement>((page, pageSize) => this.svc.nonStaff({
    type: this.type(), department: this.department(), notes: this.notes(), from: this.from(), to: this.to(), page, pageSize,
  }));
  protected readonly sum = computed(() => fmt(this.list.rows().reduce((a, r) => a + num(r.total), 0), 2));

  constructor() { this.list.load(); }
  reset() { this.type.set(''); this.department.set(''); this.notes.set(''); this.from.set(''); this.to.set(''); this.list.search(); }
  export() { exportCsv('صرفيات-غير-العاملين', ['نوع الصرفية', 'الإدارة', 'التاريخ', 'عدد الموظفين', 'الإجمالي', 'ملاحظات'], this.list.rows().map((r) => [r.type, r.dept, r.date, r.employees, r.total, r.notes])); }
  print() { printPage(); }
}
