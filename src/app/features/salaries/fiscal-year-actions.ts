import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LookupsService } from '../../shared/data/lookups.service';
import { SalariesService } from '../../shared/data/salaries.service';
import { SelectField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

/** Screen 21 – إجراءات السنة المالية (/salaries/fiscal). First card has a confirm state (S4); middle card is a counter. */
@Component({
  selector: 'app-fiscal-year-actions',
  imports: [PageHeader, SelectField, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="إجراءات السنة المالية" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'إجراءات السنة المالية' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] w-full md:max-w-[480px]">
        <app-select-field label="العام المالي" [options]="lk()?.fiscalYears ?? []" [(value)]="year" />
      </section>
      <section class="card">
        <div class="px-5 py-3 border-b border-gray-100">
          <h2 class="font-bold text-navy">العلاوة الدورية</h2>
          <p class="text-xs text-gray-400">العام المالي {{ year() }}</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-[11px] p-[11px]">
          <div class="border border-gray-200 rounded-xl p-4 flex flex-col justify-between gap-6 min-h-[100px]">
            @if (!confirming()) {
              <p class="text-sm text-gray-600">منح العلاوة الدورية لجميع الموظفين المستحقين عن العام المالي المحدد.</p>
              <button type="button" class="btn-primary w-full" (click)="confirming.set(true)"><app-icon name="arrow-up" [size]="16" /> منح العلاوة الدورية لجميع الموظفين</button>
            } @else {
              <p class="text-sm font-bold text-red-600 flex items-center gap-2"><app-icon name="alert" [size]="16" /> هل أنت متأكد؟ سيتم منح العلاوة لجميع الموظفين المستحقين عن {{ year() }} ولا يمكن التراجع.</p>
              <div class="flex gap-2">
                <button type="button" class="btn-primary flex-1" [disabled]="busy()" (click)="grant()"><app-icon name="check" [size]="16" /> تأكيد المنح</button>
                <button type="button" class="btn-outline flex-1" (click)="confirming.set(false)">إلغاء</button>
              </div>
            }
          </div>
          <div class="rounded-xl bg-edit border-t-4 border-brand p-4 flex flex-col items-center justify-center gap-3 text-center">
            <p class="text-sm text-gray-600">عدد الموظفين الذين تم منح العلاوة الدورية لهم</p>
            <p class="text-3xl font-black text-navy">{{ count()?.toLocaleString('en') ?? '—' }}</p>
          </div>
          <div class="border border-gray-200 rounded-xl p-4 flex flex-col justify-between gap-6">
            <p class="text-sm text-gray-600">عرض تقرير يتضمن البيانات التفصيلية للموظفين الذين تم منحهم العلاوة.</p>
            <button type="button" class="btn-navy w-full" (click)="report()"><app-icon name="file" [size]="16" /> عرض تقرير بيانات تفصيلية</button>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class FiscalYearActions {
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly year = signal('2026/2027');
  protected readonly count = signal<number | undefined>(undefined);
  protected readonly confirming = signal(false);
  protected readonly busy = signal(false);

  constructor() { effect(() => this.svc.grantedCount(this.year()).subscribe((n) => this.count.set(n))); }
  grant() {
    this.busy.set(true);
    this.svc.grantPeriodicRaise(this.year()).subscribe({
      next: () => { this.busy.set(false); this.confirming.set(false); this.toast.success('تم منح العلاوة الدورية'); this.svc.grantedCount(this.year()).subscribe((n) => this.count.set(n)); },
      error: () => this.busy.set(false),
    });
  }
  /** GET /fiscal-years/:year/periodic-raise/report (PDF) */
  report() { this.toast.success('جاري تجهيز التقرير...'); }
}
