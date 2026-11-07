import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanDirective } from '../../core/auth/permissions';
import { InstallmentDetails as Details, InstallmentLine, InstallmentsService, planState } from '../../shared/data/installments.service';
import { ConfirmService } from '../../shared/ui/confirm';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';
import { AppDatePipe } from '../../shared/util/date.pipe';
import { fmt } from '../../shared/util/num';

/** تفاصيل القسط (/salaries/installments/:id): plan header + monthly schedule with inline edit. */
@Component({
  selector: 'app-installment-details',
  imports: [PageHeader, Icon, FormsModule, AppDatePipe, CanDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="تفاصيل القسط" backTo="/salaries/installments"
      [breadcrumb]="[{ label: 'المرتبات' }, { label: 'بيان الأقساط', link: '/salaries/installments' }, { label: 'تفاصيل القسط' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      @if (data(); as d) {
        @let p = d.plan;
        <section class="card p-5 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          <div><p class="text-xs text-gray-400">اسم الموظف</p><p class="font-bold text-gray-800 mt-1">{{ p.employee }}</p></div>
          <div><p class="text-xs text-gray-400">نوع القسط</p><p class="font-bold text-gray-800 mt-1">{{ p.type }}</p></div>
          <div><p class="text-xs text-gray-400">إجمالي قيمة القسط</p><p class="font-bold text-navy mt-1">{{ money(p.total) }} ج.م</p></div>
          <div><p class="text-xs text-gray-400">عدد الأقساط</p><p class="font-bold text-gray-800 mt-1">{{ p.count }}</p></div>
          <div><p class="text-xs text-gray-400">تاريخ بداية القسط</p><p class="font-bold text-gray-800 mt-1">{{ p.start | appDate }}</p></div>
          <div><p class="text-xs text-gray-400">إجمالي المسدد</p><p class="font-bold text-gray-800 mt-1">{{ money(p.paid) }} ج.م</p></div>
          <div><p class="text-xs text-gray-400">إجمالي المتبقي</p><p class="font-bold text-brand mt-1">{{ money(p.remaining) }} ج.م</p></div>
          <div><p class="text-xs text-gray-400">الحالة</p>
            <span class="pill font-bold mt-1 inline-block" [class]="state() === 'ملغي' ? 'bg-gray-100 text-gray-500' : state() === 'منتهي' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'">{{ state() }}</span>
          </div>
        </section>

        <section class="card">
          <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 class="font-bold text-navy">جدول الأقساط الشهرية</h2>
            <span class="text-xs text-gray-500">{{ paidCount() }} مسددة · {{ d.lines.length - paidCount() }} متبقية</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm zebra-table">
              <thead class="table-head"><tr>
                <th class="th w-20">رقم القسط</th><th class="th">تاريخ الاستحقاق</th><th class="th">قيمة القسط</th><th class="th text-center">حالة السداد</th>
                <th class="th">تاريخ السداد</th><th class="th">ملاحظات</th><th class="th text-center w-28">إجراءات</th>
              </tr></thead>
              <tbody>
                @for (l of d.lines; track l.no) {
                  @if (editNo() === l.no) {
                    <tr class="row-edit">
                      <td class="td font-bold">{{ l.no }}</td>
                      <td class="td"><input type="date" class="input-sm w-36" [(ngModel)]="draft.due" aria-label="تاريخ الاستحقاق" /></td>
                      <td class="td"><input type="number" min="0.01" step="0.01" class="input-sm w-28" [(ngModel)]="draft.amount" aria-label="قيمة القسط" /></td>
                      <td class="td text-center">
                        <select class="input-sm" [(ngModel)]="draft.status" (ngModelChange)="onStatus()" aria-label="حالة السداد"><option>مسدد</option><option>غير مسدد</option></select>
                      </td>
                      <td class="td"><input type="date" class="input-sm w-36" [(ngModel)]="draft.paidOn" [disabled]="draft.status !== 'مسدد'" aria-label="تاريخ السداد" /></td>
                      <td class="td"><input class="input-sm w-40" [(ngModel)]="draft.notes" placeholder="ملاحظات" aria-label="ملاحظات" /></td>
                      <td class="td"><div class="flex justify-center gap-2">
                        <button type="button" class="icon-btn-save" [disabled]="saving()" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                        <button type="button" class="icon-btn-cancel" (click)="editNo.set(null)" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                      </div></td>
                    </tr>
                  } @else {
                    <tr>
                      <td class="td font-bold text-gray-700">{{ l.no }}</td>
                      <td class="td text-gray-600">{{ l.due | appDate }}</td>
                      <td class="td font-bold text-navy">{{ money(l.amount) }}</td>
                      <td class="td text-center"><span class="pill font-semibold" [class]="l.status === 'مسدد' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'">{{ l.status }}</span></td>
                      <td class="td text-gray-500">{{ l.paidOn ? (l.paidOn | appDate) : '—' }}</td>
                      <td class="td text-gray-500">{{ l.notes || '—' }}</td>
                      <td class="td"><div class="flex justify-center gap-2">
                        <ng-container *appCan="'salaries.edit'">
                          <button type="button" class="icon-btn-edit" [disabled]="editNo() !== null || p.cancelled" (click)="edit(l)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                          <button type="button" class="icon-btn-delete" [disabled]="editNo() !== null || p.cancelled || d.lines.length <= 1" (click)="remove(l)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                        </ng-container>
                      </div></td>
                    </tr>
                  }
                }
              </tbody>
              <tfoot>
                <tr class="bg-orange-50 font-bold text-navy border-t-2 border-orange-200">
                  <td class="td" colspan="2">الإجمالي</td>
                  <td class="td">{{ money(p.total) }}</td>
                  <td class="td" colspan="4">المسدد {{ money(p.paid) }} · المتبقي {{ money(p.remaining) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p class="px-5 py-3 text-xs text-gray-500">عرض {{ d.lines.length }} من {{ d.lines.length }} قسطاً</p>
        </section>
      } @else {
        <section class="card py-16 text-center text-gray-400">{{ loading() ? 'جاري التحميل...' : 'القسط غير موجود' }}</section>
      }
    </main>
  `,
})
export class InstallmentDetailsPage {
  readonly id = input.required<string>();
  private readonly svc = inject(InstallmentsService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(ConfirmService);
  protected readonly data = signal<Details | null>(null);
  protected readonly loading = signal(false);
  protected readonly money = (n: number) => fmt(n, 2);
  protected readonly state = computed(() => { const d = this.data(); return d ? planState(d.plan) : ''; });
  protected readonly paidCount = computed(() => this.data()?.lines.filter((l) => l.status === 'مسدد').length ?? 0);
  protected readonly editNo = signal<number | null>(null);
  protected draft = {} as InstallmentLine;
  protected readonly saving = signal(false);

  constructor() {
    effect((onCleanup) => {
      const id = +this.id();
      this.loading.set(true); this.data.set(null); this.editNo.set(null);
      const sub = this.svc.details(id).subscribe({ next: (d) => { this.data.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
      onCleanup(() => sub.unsubscribe());
    });
  }
  edit(l: InstallmentLine) { this.draft = { ...l }; this.editNo.set(l.no); }
  onStatus() {
    if (this.draft.status === 'مسدد' && !this.draft.paidOn) this.draft.paidOn = new Date().toISOString().slice(0, 10);
    if (this.draft.status !== 'مسدد') this.draft.paidOn = '';
  }
  save() {
    const d = { ...this.draft, amount: +this.draft.amount };
    if (!d.due) { this.toast.error('برجاء إدخال تاريخ الاستحقاق'); return; }
    if (!(d.amount > 0)) { this.toast.error('قيمة القسط لازم تكون أكبر من صفر'); return; }
    if (d.status === 'مسدد' && !d.paidOn) { this.toast.error('برجاء إدخال تاريخ السداد'); return; }
    this.saving.set(true);
    this.svc.saveLine(+this.id(), d).subscribe({
      next: (r) => { this.data.set(r); this.editNo.set(null); this.saving.set(false); this.toast.success('تم حفظ القسط'); },
      error: () => this.saving.set(false),
    });
  }
  async remove(l: InstallmentLine) {
    if (!(await this.dialog.ask(`حذف القسط رقم ${l.no}؟ هيتعاد ترقيم باقي الأقساط.`))) return;
    this.svc.removeLine(+this.id(), l.no).subscribe((r) => { this.data.set(r); this.toast.success('تم الحذف'); });
  }
}
