import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LookupsService } from '../../shared/data/lookups.service';
import { PayrollSummary } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { SelectField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

type Scope = 'appointType' | 'department' | 'employee';

/** Screen 20 – حساب المرتبات والصرفيات (/salaries/calculate). Radio picks which selector is enabled. */
@Component({
  selector: 'app-payroll-calculation',
  imports: [PageHeader, SelectField, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="حساب المرتبات والصرفيات" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'حساب المرتبات والصرفيات' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3" role="radiogroup" aria-label="نطاق الحساب">
          @for (o of scopes; track o.v) {
            <button type="button" role="radio" [attr.aria-checked]="scope() === o.v" (click)="scope.set(o.v)"
              class="flex items-center gap-2 h-12 px-4 rounded-xl border text-sm font-bold transition-colors"
              [class]="scope() === o.v ? 'bg-edit border-brand text-navy' : 'bg-white border-gray-200 text-gray-600'">
              <span class="w-4 h-4 rounded-full border-2 flex items-center justify-center" [class]="scope() === o.v ? 'border-brand' : 'border-gray-300'">
                @if (scope() === o.v) { <span class="w-2 h-2 rounded-full bg-brand"></span> }
              </span>
              {{ o.l }}
            </button>
          }
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <app-select-field label="نوع التعيين" placeholder="اختر نوع التعيين" [options]="lk()?.appointTypes ?? []" [disabled]="scope() !== 'appointType'" [(value)]="appointType" />
          <app-select-field label="الإدارة" placeholder="اختر الإدارة" [options]="lk()?.departments ?? []" [disabled]="scope() !== 'department'" [(value)]="department" />
          <app-select-field label="الموظف" placeholder="اختر الموظف" [options]="lk()?.employees ?? []" [disabled]="scope() !== 'employee'" [(value)]="employee" />
          <app-select-field label="نوع الصرفية" [options]="lk()?.disbursementTypes ?? []" [(value)]="disbursement" />
          <app-select-field label="الشهر" [options]="lk()?.months ?? []" [(value)]="month" />
          <app-select-field label="السنة" [options]="lk()?.years ?? []" [(value)]="year" />
        </div>
        <div class="flex gap-2 border-t border-gray-100 mt-4 pt-4">
          <button type="button" class="btn-primary" [disabled]="busy()" (click)="calc()"><app-icon name="calculator" [size]="16" /> {{ busy() ? 'جاري الحساب...' : 'حساب المرتبات' }}</button>
          <button type="button" class="btn-navy" [disabled]="!summary()" (click)="approve()"><app-icon name="check" [size]="16" /> اعتماد الصرف</button>
        </div>
      </section>

      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[11px]">
        @for (c of cards(); track c.l) {
          <div class="card-plain border-t-4 p-4 flex flex-col justify-between min-h-[110px]" [style.border-top-color]="c.color">
            <p class="text-sm text-gray-600">{{ c.l }}</p>
            <p class="text-2xl font-black text-left" [class]="c.cls">{{ c.v }} @if (c.unit) { <span class="text-xs text-gray-400 font-normal">ج.م</span> }</p>
          </div>
        }
      </section>
    </main>
  `,
})
export class PayrollCalculation {
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly scopes: { v: Scope; l: string }[] = [{ v: 'appointType', l: 'نوع التعيين' }, { v: 'department', l: 'الإدارة' }, { v: 'employee', l: 'موظف' }];
  protected readonly scope = signal<Scope>('appointType');
  protected readonly appointType = signal('تعيين دائم');
  protected readonly department = signal('');
  protected readonly employee = signal('');
  protected readonly disbursement = signal('مرتب شهري');
  protected readonly month = signal('أكتوبر');
  protected readonly year = signal('2026');
  protected readonly busy = signal(false);
  protected readonly summary = signal<PayrollSummary | null>(null);
  protected readonly cards = computed(() => {
    const s = this.summary();
    const v = (x?: string | number) => (s ? String(x) : '—');
    return [
      { l: 'عدد الموظفين الذين تم الحساب لهم', v: v(s?.calculated), color: '#1e3461', cls: 'text-navy', unit: false },
      { l: 'إجمالي الاستحقاقات', v: v(s?.totalEntitlements), color: '#f47920', cls: 'text-navy', unit: true },
      { l: 'إجمالي الاستقطاعات', v: v(s?.totalDeductions), color: '#f47920', cls: 'text-navy', unit: true },
      { l: 'إجمالي الصافي', v: v(s?.totalNet), color: '#f47920', cls: 'text-navy', unit: true },
      { l: 'عدد الموظفين الذين لم يتم حساب الصرفية لهم', v: v(s?.notCalculated), color: '#f47920', cls: 'text-red-600', unit: false },
    ];
  });

  constructor() {
    effect(() => {
      const l = this.lk();
      if (!l) return;
      if (!l.appointTypes.includes(this.appointType())) this.appointType.set(l.appointTypes[0] ?? '');
      if (!l.disbursementTypes.includes(this.disbursement())) this.disbursement.set(l.disbursementTypes[0] ?? '');
    });
  }

  private body() {
    const target = { appointType: this.appointType(), department: this.department(), employee: this.employee() }[this.scope()];
    return { scope: this.scope(), target, disbursement: this.disbursement(), month: this.month(), year: this.year() };
  }
  calc() {
    if (!this.body().target) { this.toast.error('برجاء اختيار قيمة للنطاق المحدد'); return; }
    this.busy.set(true);
    this.svc.calculate(this.body()).subscribe({ next: (s) => { this.summary.set(s); this.busy.set(false); }, error: () => this.busy.set(false) });
  }
  approve() {
    if (!confirm('تأكيد اعتماد الصرف؟')) return;
    this.svc.approve(this.body()).subscribe(() => this.toast.success('تم اعتماد الصرف'));
  }
}
