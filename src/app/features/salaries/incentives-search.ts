import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LookupsService } from '../../shared/data/lookups.service';
import { IncentiveSheet } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { SelectField, TextField } from '../../shared/ui/fields';
import { Icon, IconName } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { ToastService } from '../../shared/ui/toast';
import { exportCsv, printPage } from '../../shared/util/export';
import { ListState } from '../../shared/util/list-state';

/** Screen 08 – بحث عن كشف صرفية حافز (/salaries/incentives). */
@Component({
  selector: 'app-incentives-search',
  imports: [PageHeader, SelectField, TextField, Icon, Pagination, TableState, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="بحث عن كشف صرفية حافز" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'كشوف حوافز' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] no-print">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <app-select-field label="نوع الصرفية" placeholder="** جميع الأنواع **" [options]="lk()?.incentiveTypes ?? []" [(value)]="type" />
          <app-select-field label="الإدارة" placeholder="** جميع الإدارات **" [options]="lk()?.departments ?? []" [(value)]="department" />
          <app-text-field label="ملاحظات" [(value)]="notes" />
          <app-text-field label="تاريخ الصرفية من" kind="date" [(value)]="from" />
          <app-text-field label="تاريخ الصرفية إلى" kind="date" [(value)]="to" />
        </div>
        <div class="flex gap-2 mt-4">
          <button type="button" class="btn-primary" (click)="list.search()"><app-icon name="search" [size]="16" /> بحث</button>
          <button type="button" class="btn-outline" (click)="reset()"><app-icon name="refresh" [size]="16" /> مسح</button>
        </div>
      </section>

      <section class="card p-[13px] flex flex-wrap gap-2 no-print">
        <a routerLink="/salaries/incentives/new" class="btn-primary"><app-icon name="plus" [size]="16" /> كشف جديد</a>
        @for (a of actions; track a.label) {
          <button type="button" class="btn-outline" (click)="run(a.label)"><app-icon [name]="a.icon" [size]="16" /> {{ a.label }}</button>
        }
      </section>

      <section class="card">
        <p class="px-5 py-3 text-sm text-gray-600">إجمالي النتائج: <b class="text-navy">{{ list.total() }}</b> صرفية</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              <th class="th">بيان الصرف</th><th class="th">الإدارة</th><th class="th">التاريخ</th><th class="th">ملاحظات</th><th class="th text-center w-20">عرض</th>
            </tr></thead>
            <tbody>
              @for (r of list.rows(); track r.id) {
                <tr>
                  <td class="td font-bold text-gray-800">{{ r.payment }}</td>
                  <td class="td text-gray-600">{{ r.dept }}</td>
                  <td class="td text-gray-600">{{ r.date }}</td>
                  <td class="td text-gray-400 whitespace-normal">{{ r.notes }}</td>
                  <td class="td text-center">
                    <a [routerLink]="['/salaries/incentives', r.id]" class="inline-flex w-7 h-7 rounded-full border border-brand text-brand items-center justify-center hover:bg-orange-50" aria-label="عرض التفاصيل">
                      <app-icon name="eye" [size]="15" />
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr appTableState [cols]="5" [loading]="list.loading()" [error]="list.error()" (retry)="list.load()" emptyText="لا توجد كشوف مطابقة"></tr>
              }
            </tbody>
          </table>
        </div>
        <app-pagination [page]="list.page()" (pageChange)="list.go($event)" [pageSize]="list.pageSize()" (pageSizeChange)="list.resize($event)" [total]="list.total()" />
      </section>
    </main>
  `,
})
export class IncentivesSearch {
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly type = signal('');
  protected readonly department = signal('');
  protected readonly notes = signal('');
  protected readonly from = signal('2026-01-01');
  protected readonly to = signal('2026-12-31');
  protected readonly list = new ListState<IncentiveSheet>((page, pageSize) => this.svc.incentiveSheets({
    type: this.type(), department: this.department(), notes: this.notes(), from: this.from(), to: this.to(), page, pageSize,
  }));
  /** Each button maps to a server-side report: GET /incentives/reports/{key}?… */
  protected readonly actions: { label: string; icon: IconName }[] = [
    { label: 'طباعة', icon: 'print' }, { label: 'طباعة مع بيان الأساسي', icon: 'print' }, { label: 'نموذج المعاشات ٢٠٢٤', icon: 'users' },
    { label: 'فيشة حوافز', icon: 'info' }, { label: 'خصومات الربع', icon: 'percent' }, { label: 'نموذج تأمين مرضي', icon: 'shield' },
    { label: 'تصدير إكسل', icon: 'file' }, { label: 'طباعة تكاليف ملخص', icon: 'print' }, { label: 'طباعة تكاليف', icon: 'print' },
  ];

  constructor() { this.list.load(); }
  reset() { this.type.set(''); this.department.set(''); this.notes.set(''); this.list.search(); }
  run(label: string) {
    if (label === 'طباعة') printPage();
    else if (label === 'تصدير إكسل') exportCsv('كشوف-الحوافز', ['بيان الصرف', 'الإدارة', 'التاريخ', 'ملاحظات'], this.list.rows().map((r) => [r.payment, r.dept, r.date, r.notes]));
    else this.toast.success(`سيتم تجهيز "${label}" من الخادم`);
  }
}
