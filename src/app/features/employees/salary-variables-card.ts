import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SalaryVariables } from '../../shared/data/models';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../shared/ui/icon';

/** "متغيرات حساب المرتب" — used in the employee profile (salary tab) and in /salaries/payroll. */
@Component({
  selector: 'app-salary-variables',
  imports: [Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card p-5">
      <div class="flex items-center gap-2 mb-4 text-brand">
        <app-icon name="wallet" [size]="20" /><h2 class="font-bold text-navy text-base">متغيرات حساب المرتب</h2>
      </div>
      @if (data(); as d) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 mb-6">
          @for (f of d.fields; track f.label) {
            <div class="flex flex-col gap-1">
              <p class="text-xs text-gray-400 font-medium">{{ f.label }}</p>
              @if (editable()) {
                @if (f.badge) {
                  <select class="input !py-2 font-bold" [(ngModel)]="f.value" [attr.aria-label]="f.label"><option>نعم</option><option>لا</option></select>
                } @else if (f.label === 'البنك') {
                  <select class="input !py-2 font-bold text-navy" [(ngModel)]="f.value" [attr.aria-label]="f.label">@for (b of banks; track b) { <option>{{ b }}</option> }</select>
                } @else {
                  <input class="input !py-2 font-bold text-navy" [class.!bg-gray-100]="f.label === 'تاريخ آخر مرتب'" [readOnly]="f.label === 'تاريخ آخر مرتب'" [(ngModel)]="f.value" [attr.aria-label]="f.label" />
                }
              } @else if (f.badge) { <span class="pill !py-0.5 bg-green-100 text-green-700 w-fit font-bold">{{ f.value }}</span> }
              @else { <p class="text-sm font-bold text-navy">{{ f.value || '—' }}</p> }
            </div>
          }
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div class="rounded-xl border border-gray-100 overflow-hidden">
            <div class="px-4 py-2.5 border-b border-gray-100 bg-blue-50"><p class="text-sm font-bold text-blue-700">البدل النقدي</p></div>
            <ul class="px-4 py-3 flex flex-col gap-2">
              @for (r of d.cashAllowance; track r.label) {
                <li class="flex items-center justify-between gap-3 text-sm"><span class="text-gray-500">{{ r.label }}</span>
                  @if (editable()) {
                    @if (r.label === 'طريقة الطباعة') { <select class="input !py-1.5 !w-36" [(ngModel)]="r.value" [attr.aria-label]="r.label"><option>المرتب</option><option>منفصل</option></select> }
                    @else { <input class="input !py-1.5 !w-36" [(ngModel)]="r.value" [attr.aria-label]="r.label" /> }
                  } @else { <span class="font-bold text-navy">{{ r.value }}</span> }
                </li>
              }
            </ul>
          </div>
          @for (b of boxes(d); track b.title) {
            <div class="rounded-xl border border-gray-100 overflow-hidden">
              <div class="px-4 py-2.5 border-b border-gray-100" [class]="b.head"><p class="text-sm font-bold">{{ b.title }}</p></div>
              <div class="px-4 py-3">
                @if (editable()) {
                  <select class="input !py-1.5" [ngModel]="b.value" (ngModelChange)="d[b.key] = $event" [attr.aria-label]="b.title">@for (o of b.opts; track o) { <option>{{ o }}</option> }</select>
                } @else {
                <span class="pill !px-3 !text-sm font-bold" [class]="b.value === 'مشترك' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                  <span class="w-2 h-2 rounded-full" [class]="b.value === 'مشترك' ? 'bg-green-500' : 'bg-gray-400'"></span>{{ b.value }}
                </span>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <p class="text-sm text-gray-400 py-6 text-center">جاري التحميل...</p>
      }
    </section>
  `,
})
export class SalaryVariablesCard {
  readonly data = input<SalaryVariables>();
  /** Edit mode (frame 06g) – mutates the object passed in `data` (the caller passes a draft copy). */
  readonly editable = input(false);
  protected readonly banks = ['بنك مصر', 'البنك الأهلي', 'بنك القاهرة', 'البنك التجاري الدولي'];
  protected boxes(d: SalaryVariables) {
    return [
      { key: 'disability' as const, opts: ['لا يوجد', 'يوجد'], title: 'الإعاقة', value: d.disability, head: 'bg-purple-50 text-purple-700' },
      { key: 'endOfService' as const, opts: ['مشترك', 'غير مشترك'], title: 'صندوق نهاية الخدمة', value: d.endOfService, head: 'bg-orange-50 text-orange-700' },
      { key: 'socialAid' as const, opts: ['مشترك', 'غير مشترك'], title: 'جمعية المساعدات الاجتماعية', value: d.socialAid, head: 'bg-green-50 text-green-700' },
    ];
  }
}
