import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/api/api.service';
import { LookupsService } from '../../shared/data/lookups.service';
import { SelectField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

interface SlipLine { name: string; amount: string; }
interface Slip { employee: string; code: string; department: string; period: string; earnings: SlipLine[]; deductions: SlipLine[]; totalEarnings: string; totalDeductions: string; net: string; }
const MOCK_SLIP = (employee: string, period: string): Slip => ({
  employee, code: '٠٠٠٦٧', department: 'الإدارة العامة للشئون الفنية', period,
  earnings: [{ name: 'المرتب الأساسي', amount: '٧٨٦١٫١٥' }, { name: 'علاوة دورية', amount: '٧٨٦٫١٢' }, { name: 'بدل طبيعة عمل', amount: '٧٥٠٫٠٠' }, { name: 'حافز دوري', amount: '٧٨٦٫١٢' }],
  deductions: [{ name: 'التأمينات الاجتماعية', amount: '٨٦٤٫٧٣' }, { name: 'ضريبة كسب العمل', amount: '٤١٢٫٥٠' }, { name: 'قسط سلفة', amount: '٣٠٠٫٠٠' }],
  totalEarnings: '١٠١٨٣٫٣٩', totalDeductions: '١٥٧٧٫٢٣', net: '٨٦٠٦٫١٦',
});

/** Screen 18 – طباعة مفردات المرتب (/salaries/salary-slip). Pick employee/month/year, then print the slip (window.print + print CSS). */
@Component({
  selector: 'app-salary-slip-print',
  imports: [PageHeader, SelectField, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="طباعة مفردات المرتب" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'طباعة مفردات المرتب' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] no-print">
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-3 pb-4 border-b border-gray-100">
          <app-select-field label="اسم الموظف" [options]="lk()?.employees ?? []" [(value)]="employee" />
          <app-select-field label="الشهر" [options]="months" [(value)]="month" />
          <app-select-field label="السنة" [options]="lk()?.years ?? ['2026']" [(value)]="year" />
        </div>
        <div class="flex justify-start mt-4">
          <button type="button" class="btn-primary" (click)="print()"><app-icon name="print" [size]="16" /> طباعة</button>
        </div>
      </section>

      @if (slip(); as s) {
        <section class="slip card-plain p-8 mx-auto w-full max-w-3xl print:block hidden">
          <header class="flex items-center justify-between border-b-2 border-navy pb-3 mb-4">
            <div><p class="font-bold text-navy">شركة مصر العليا لتوزيع الكهرباء</p><p class="text-xs text-gray-500">مفردات مرتب شهر {{ s.period }}</p></div>
            <img src="assets/ueedc-logo.png" alt="" class="w-14 h-14 object-contain" />
          </header>
          <div class="grid grid-cols-3 gap-3 text-sm mb-4">
            <p>الاسم: <b>{{ s.employee }}</b></p><p>الكود: <b>{{ s.code }}</b></p><p>الإدارة: <b>{{ s.department }}</b></p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            @for (blk of [{ t: 'الاستحقاقات', l: s.earnings, sum: s.totalEarnings }, { t: 'الاستقطاعات', l: s.deductions, sum: s.totalDeductions }]; track blk.t) {
              <table class="w-full border border-gray-300">
                <thead><tr class="bg-gray-100"><th class="p-2 text-right" colspan="2">{{ blk.t }}</th></tr></thead>
                <tbody>
                  @for (x of blk.l; track x.name) { <tr class="border-t border-gray-200"><td class="p-2">{{ x.name }}</td><td class="p-2 text-left">{{ x.amount }}</td></tr> }
                  <tr class="border-t-2 border-gray-400 font-bold"><td class="p-2">الإجمالي</td><td class="p-2 text-left">{{ blk.sum }}</td></tr>
                </tbody>
              </table>
            }
          </div>
          <p class="mt-4 text-lg font-bold text-navy">صافي المرتب: {{ s.net }} ج.م</p>
        </section>
      }
    </main>
  `,
  styles: `@media print { :host .slip { display: block !important; border: none; } }`,
})
export class SalarySlipPrint {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  protected readonly employee = signal('أحمد محمد علي');
  protected readonly month = signal('أكتوبر');
  protected readonly year = signal('2026');
  protected readonly slip = signal<Slip | null>(null);

  /** GET /payroll/slip?employee=&month=&year= then window.print(). */
  print() {
    if (!this.employee()) { this.toast.error('برجاء اختيار الموظف'); return; }
    const q = { employee: this.employee(), month: this.month(), year: this.year() };
    this.api.get<Slip>('/payroll/slip', q, () => MOCK_SLIP(q.employee, `${q.month} ${q.year}`)).subscribe((s) => {
      this.slip.set(s);
      setTimeout(() => window.print(), 50);
    });
  }
}
