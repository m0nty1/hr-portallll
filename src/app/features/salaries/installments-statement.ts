import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LookupsService } from '../../shared/data/lookups.service';
import { Installment } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { SelectField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { exportCsv, printPage } from '../../shared/util/export';
import { ListState } from '../../shared/util/list-state';

/** Screen 10 – بيان الأقساط (/salaries/installments). "الجملة" = sum of the الإجمالي column. */
@Component({
  selector: 'app-installments-statement',
  imports: [PageHeader, SelectField, Icon, Pagination, TableState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="بيان الأقساط" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'بيان الأقساط' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] no-print">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <app-select-field label="بيان القسط" placeholder="** جميع بيانات الأقساط **" [options]="types() ?? []" [(value)]="type" />
          <app-select-field label="الإدارة" placeholder="** جميع الإدارات **" [options]="lk()?.departments ?? []" [(value)]="department" />
          <app-select-field label="مركز التكلفة" placeholder="** جميع المراكز **" [options]="lk()?.costCenters ?? []" [(value)]="costCenter" />
          <app-select-field label="اسم الموظف" placeholder="** جميع الموظفين **" [options]="lk()?.employees ?? []" [(value)]="employee" />
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
          <span>إجمالي النتائج: <b class="text-brand">{{ list.total() }}</b> قسط</span>
          <span>الجملة: <b class="text-brand">{{ sum() }} ج.م</b></span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              <th class="th">اسم الموظف</th><th class="th">بيان القسط</th><th class="th">قيمة القسط</th><th class="th">بداية القسط</th>
              <th class="th text-center">عدد الأقساط</th><th class="th">الإجمالي</th><th class="th">ملاحظات</th>
            </tr></thead>
            <tbody>
              @for (r of list.rows(); track $index) {
                <tr>
                  <td class="td font-bold text-gray-800">{{ r.name }}</td>
                  <td class="td text-gray-600">{{ r.desc }}</td>
                  <td class="td font-bold text-navy">{{ r.value }} ج.م</td>
                  <td class="td text-gray-500">{{ r.from }}</td>
                  <td class="td text-center text-gray-700">{{ r.count }}</td>
                  <td class="td font-bold text-brand">{{ r.total }}</td>
                  <td class="td text-gray-400">{{ r.notes || '—' }}</td>
                </tr>
              } @empty {
                <tr appTableState [cols]="7" [loading]="list.loading()" [error]="list.error()" (retry)="list.load()" emptyText="لا توجد أقساط"></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="list.page()" (pageChange)="list.go($event)" [pageSize]="list.pageSize()" (pageSizeChange)="list.resize($event)" [total]="list.total()" />
      </section>
    </main>
  `,
})
export class InstallmentsStatement {
  private readonly svc = inject(SalariesService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly types = toSignal(this.svc.installmentTypes());
  protected readonly type = signal('');
  protected readonly department = signal('');
  protected readonly costCenter = signal('');
  protected readonly employee = signal('');
  protected readonly list = new ListState<Installment>((page, pageSize) => this.svc.installments({
    type: this.type(), department: this.department(), costCenter: this.costCenter(), employee: this.employee(), page, pageSize,
  }));
  protected readonly sum = computed(() => {
    const n = (v: string) => +v.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^\d.]/g, '') || 0;
    return this.list.rows().reduce((a, r) => a + n(r.total), 0).toLocaleString('ar-EG');
  });

  constructor() { this.list.load(); }
  reset() { this.type.set(''); this.department.set(''); this.costCenter.set(''); this.employee.set(''); this.list.search(); }
  export() { exportCsv('بيان-الأقساط', ['اسم الموظف', 'بيان القسط', 'قيمة القسط', 'بداية القسط', 'عدد الأقساط', 'الإجمالي', 'ملاحظات'], this.list.rows().map((r) => [r.name, r.desc, r.value, r.from, r.count, r.total, r.notes])); }
  print() { printPage(); }
}
