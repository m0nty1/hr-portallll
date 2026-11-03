import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonStaffDisbursement, NonStaffLine } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { exportCsv, printPage } from '../../shared/util/export';
import { fmt, num } from '../../shared/util/num';

/** Screen 19b – تفاصيل صرفية غير العاملين (/salaries/non-staff/:id). Navy summary card + employees table with a totals row. */
@Component({
  selector: 'app-non-staff-details',
  imports: [PageHeader, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="تفاصيل الصرفية" backTo="/salaries/non-staff"
      [breadcrumb]="[{ label: 'المرتبات والحوافز' }, { label: 'صرفيات غير العاملين', link: '/salaries/non-staff' }, { label: 'تفاصيل الصرفية' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      @if (d(); as d) {
        <section class="rounded-[17px] bg-navy text-white p-[17px]">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold">{{ d.type }}</h2>
            <span class="pill bg-white/15 text-white">رقم الصرفية: #000{{ d.id }}</span>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
            @for (f of fields(); track f.l) {
              <div class="bg-white/10 rounded-xl px-4 py-3"><p class="text-xs text-blue-200">{{ f.l }}</p><p class="font-bold mt-1" [class]="f.c ?? ''">{{ f.v }}</p></div>
            }
          </div>
          <p class="border-t border-white/15 mt-4 pt-3 text-sm"><b>ملاحظات:</b> <span class="text-blue-100">{{ d.notes }}</span></p>
        </section>
      }
      <div class="flex justify-end gap-2 no-print">
        <button type="button" class="btn-outline !bg-white" (click)="print()"><app-icon name="print" [size]="16" /> طباعة</button>
        <button type="button" class="btn-outline !bg-white" (click)="export()"><app-icon name="file" [size]="16" /> تصدير Excel</button>
      </div>
      <section class="card">
        <p class="px-5 py-3 text-sm text-gray-600">بيانات الموظفين: <b class="text-brand">{{ lines().length }}</b> موظف</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              <th class="th">كود الموظف</th><th class="th">اسم الموظف</th><th class="th">الإدارة</th><th class="th">الأساسي (ج.م)</th>
              <th class="th">قيمة الصرفية (ج.م)</th><th class="th">الخصومات (ج.م)</th><th class="th !text-brand">الصافي (ج.م)</th>
            </tr></thead>
            <tbody>
              @for (l of lines(); track l.code) {
                <tr>
                  <td class="td text-gray-400">{{ l.code }}</td><td class="td font-semibold text-gray-800">{{ l.name }}</td><td class="td text-gray-500">{{ l.dept }}</td>
                  <td class="td">{{ l.basic }}</td><td class="td font-bold text-navy">{{ l.incentive }}</td>
                  <td class="td text-red-500">{{ l.deductions }}</td><td class="td font-bold text-brand">{{ l.net }}</td>
                </tr>
              }
            </tbody>
            <tfoot><tr class="bg-gray-50 border-t-2 border-gray-200 font-bold">
              <td class="td" colspan="3">الإجمالي</td><td class="td">{{ t().basic }}</td><td class="td text-navy">{{ t().incentive }}</td>
              <td class="td text-red-500">{{ t().deductions }}</td><td class="td text-brand">{{ t().net }}</td>
            </tr></tfoot>
          </table>
        </div>
      </section>
    </main>
  `,
})
export class NonStaffDetails {
  readonly id = input.required<string>();
  private readonly svc = inject(SalariesService);
  private readonly datePipe = new AppDatePipe();
  protected readonly d = signal<NonStaffDisbursement | undefined>(undefined);
  protected readonly lines = signal<NonStaffLine[]>([]);
  protected readonly fields = computed(() => {
    const d = this.d();
    return d ? [
      { l: 'الإدارة', v: d.dept }, { l: 'تاريخ الصرفية', v: this.datePipe.transform(d.date) }, { l: 'النسبة', v: d.ratio, c: 'text-brand' },
      { l: 'عدد الموظفين', v: String(d.employees) }, { l: 'إجمالي الصرفية', v: d.total + ' ج.م', c: 'text-brand' },
    ] : [];
  });
  protected readonly t = computed(() => {
    const s = (k: keyof NonStaffLine) => fmt(this.lines().reduce((a, l) => a + num(l[k]), 0));
    return { basic: s('basic'), incentive: s('incentive'), deductions: s('deductions'), net: s('net') };
  });

  constructor() {
    effect(() => {
      const id = +this.id();
      this.svc.nonStaffItem(id).subscribe((d) => this.d.set(d));
      this.svc.nonStaffLines(id).subscribe((l) => this.lines.set(l));
    });
  }
  print() { printPage(); }
  export() { exportCsv('تفاصيل-الصرفية', ['الكود', 'الاسم', 'الإدارة', 'الأساسي', 'قيمة الصرفية', 'الخصومات', 'الصافي'], this.lines().map((l) => [l.code, l.name, l.dept, l.basic, l.incentive, l.deductions, l.net])); }
}
