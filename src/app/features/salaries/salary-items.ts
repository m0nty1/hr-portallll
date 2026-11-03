import { CanDirective } from '../../core/auth/permissions';
import { ConfirmService } from '../../shared/ui/confirm';
import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CalcMethod, ItemType, SalaryItem } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { SelectField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';
import { ItemTypePill } from './item-type-pill';

/** Screen 11 – بنود المرتبات (/salaries/items). Inline add/edit (state S5); list icon opens /salaries/items/:code when hasDetails. */
@Component({
  selector: 'app-salary-items',
  imports: [CanDirective, PageHeader, SelectField, Icon, FormsModule, RouterLink, ItemTypePill],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="بنود المرتبات" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'بنود المرتبات' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] flex flex-col sm:flex-row items-end gap-3">
        <app-select-field class="flex-1 w-full" label="المجموعة الرئيسية للبنود" [options]="groupNames()" [(value)]="group" />
        <button *appCan="'salaries.edit'" type="button" class="btn-primary" (click)="add()" [disabled]="editing() !== null"><app-icon name="plus" [size]="16" /> إضافة بند</button>
      </section>
      <section class="card">
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              <th class="th">كود البند</th><th class="th">نوع البند</th><th class="th">اسم البند</th><th class="th">طريقة الحساب</th><th class="th">قيمة البند</th>
              <th class="th">يعتمد على بند</th><th class="th">نوع القسط</th><th class="th text-center">الترتيب</th><th class="th text-center">له تفاصيل</th><th class="th text-center">إجراءات</th>
            </tr></thead>
            <tbody>
              @for (r of rows(); track r.id) {
                @if (editing() === r.id) {
                  <tr class="row-edit">
                    <td class="td"><input class="input-sm w-24" [(ngModel)]="d.code" aria-label="كود البند" /></td>
                    <td class="td"><select class="input-sm" [(ngModel)]="d.type" aria-label="نوع البند">@for (t of types; track t) { <option>{{ t }}</option> }</select></td>
                    <td class="td"><input class="input-sm w-40" [(ngModel)]="d.name" aria-label="اسم البند" /></td>
                    <td class="td"><select class="input-sm" [(ngModel)]="d.calculation" aria-label="طريقة الحساب">@for (t of calcs; track t) { <option>{{ t }}</option> }</select></td>
                    <td class="td"><input class="input-sm w-20" [(ngModel)]="d.value" aria-label="قيمة البند" /></td>
                    <td class="td"><select class="input-sm" [(ngModel)]="d.dependsOn" aria-label="يعتمد على بند"><option value="">—</option>@for (x of rows(); track x.id) { <option>{{ x.code }}</option> }</select></td>
                    <td class="td"><input class="input-sm w-28" [(ngModel)]="d.installmentType" aria-label="نوع القسط" /></td>
                    <td class="td"><input class="input-sm w-14 text-center" [(ngModel)]="d.order" aria-label="الترتيب" /></td>
                    <td class="td text-center"><input type="checkbox" class="checkbox" [(ngModel)]="d.hasDetails" aria-label="له تفاصيل" /></td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-save" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td>
                  </tr>
                } @else {
                  <tr>
                    <td class="td font-bold text-navy">{{ r.code }}</td>
                    <td class="td"><app-item-type-pill [type]="r.type" /></td>
                    <td class="td text-gray-800">{{ r.name }}</td>
                    <td class="td text-gray-500">{{ r.calculation }}</td>
                    <td class="td">@if (r.value === 'تلقائي') { <span class="pill bg-gray-100 text-gray-500">تلقائي</span> } @else { {{ r.value }} }</td>
                    <td class="td text-gray-500">{{ r.dependsOn || '—' }}</td>
                    <td class="td text-gray-500">{{ r.installmentType || '—' }}</td>
                    <td class="td text-center font-bold text-navy">{{ r.order }}</td>
                    <td class="td"><div class="flex items-center justify-center gap-2">
                      <input type="checkbox" class="checkbox" [checked]="r.hasDetails" disabled aria-label="له تفاصيل" />
                      @if (r.hasDetails) {
                        <a [routerLink]="['/salaries/items', r.code]" class="icon-btn border-brand text-brand hover:bg-orange-50" aria-label="تفاصيل البند"><app-icon name="list" [size]="15" /></a>
                      } @else { <span class="icon-btn border-gray-200 text-gray-300"><app-icon name="list" [size]="15" /></span> }
                    </div></td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button *appCan="'salaries.edit'" type="button" class="icon-btn-edit" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                      <button *appCan="'salaries.edit'" type="button" class="icon-btn-delete" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                    </div></td>
                  </tr>
                }
              } @empty {
                <tr><td colspan="10" class="py-12 text-center text-sm text-gray-400">لا توجد بنود في هذه المجموعة</td></tr>
              }
            </tbody>
          </table>
        </div>
        <p class="px-5 py-3 text-sm text-gray-500">عرض {{ rows().length }} من {{ rows().length }} بنود</p>
      </section>
    </main>
  `,
})
export class SalaryItems {
  private readonly dialog = inject(ConfirmService);
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  private readonly groups = toSignal(this.svc.groups(), { initialValue: [] });
  protected readonly groupNames = () => ['المرتب الأساسي والعلاوات', ...this.groups().map((g) => g.name)];
  protected readonly group = signal('المرتب الأساسي والعلاوات');
  protected readonly rows = signal<SalaryItem[]>([]);
  protected readonly editing = signal<number | null>(null);
  protected readonly types: ItemType[] = ['استحقاق', 'استقطاع', 'أخرى'];
  protected readonly calcs: CalcMethod[] = ['قيمة', 'نسبة', 'حساب'];
  protected d = {} as SalaryItem;
  private isNew = false;

  constructor() { effect((onCleanup) => { const g = this.group(); untracked(() => this.editing.set(null)); const sub = this.svc.items(g).subscribe((r) => this.rows.set(r)); onCleanup(() => sub.unsubscribe()); }); }

  edit(r: SalaryItem) { this.isNew = false; this.d = { ...r }; this.editing.set(r.id); }
  add() {
    const r: SalaryItem = { id: Date.now(), code: '', type: 'استحقاق', name: '', calculation: 'قيمة', value: '', dependsOn: '', installmentType: '', order: String(this.rows().length + 1).padStart(2, '0'), hasDetails: false };
    this.rows.update((rs) => [...rs, r]);
    this.edit(r);
    this.isNew = true;
  }
  cancel() { if (this.isNew) this.rows.update((rs) => rs.filter((r) => r.id !== this.editing())); this.editing.set(null); }
  /** Value must match the calculation method; order is a 1–99 number; codes are unique. */
  private validate(d: SalaryItem): string | null {
    if (!d.code.trim() || !d.name.trim()) return 'برجاء إدخال كود واسم البند';
    if (this.rows().some((r) => r.id !== d.id && r.code.trim() === d.code.trim())) return 'كود البند مستخدم بالفعل';
    const v = d.value.replace(/,/g, '').trim();
    if (d.calculation === 'قيمة' && !/^\d+(\.\d+)?$/.test(v)) return 'قيمة البند لازم تكون رقم (مثال: 5000)';
    if (d.calculation === 'نسبة' && !/^\d+(\.\d+)?%?$/.test(v)) return 'النسبة لازم تكون رقم (مثال: 10%)';
    if (d.calculation === 'نسبة' && parseFloat(v) > 100) return 'النسبة لا يمكن أن تزيد عن 100%';
    if (!/^\d{1,2}$/.test(d.order.trim()) || +d.order < 1) return 'الترتيب لازم يكون رقم من 1 إلى 99';
    return null;
  }
  protected readonly saving = signal(false);
  save() {
    if (this.saving()) return;
    const d: SalaryItem = { ...this.d, value: this.d.calculation === 'حساب' ? 'تلقائي' : this.d.value.trim(), order: this.d.order.trim().padStart(2, '0') };
    if (d.calculation === 'نسبة' && !d.value.endsWith('%')) d.value += '%';
    const err = this.validate(d);
    if (err) { this.toast.error(err); return; }
    const tempId = d.id, isNew = this.isNew;
    this.saving.set(true);
    this.svc.saveItem(d, isNew).subscribe({
      next: (saved) => {
        this.rows.update((rs) => rs.map((r) => (r.id === tempId ? { ...d, ...saved } : r)));
        this.isNew = false;
        this.editing.set(null);
        this.saving.set(false);
        this.toast.success('تم حفظ البند');
      },
      error: () => this.saving.set(false),
    });
  }
  async remove(r: SalaryItem) {
    if (!(await this.dialog.ask(`حذف البند ${r.name}؟`))) return;
    this.svc.deleteItem(r.id).subscribe(() => { this.rows.update((rs) => rs.filter((x) => x.id !== r.id)); this.toast.success('تم الحذف'); });
  }
}
