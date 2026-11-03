import { CanDirective } from '../../core/auth/permissions';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EmployeeItem } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

/**
 * Screen 14 – تخصيص بنود المرتبات للموظفين (/salaries/allocation).
 * Employee = input + datalist. Allocated rows get a light-orange background; "فعال" toggle is disabled unless allocated.
 */
@Component({
  selector: 'app-salary-allocation',
  imports: [CanDirective, PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="تخصيص بنود المرتبات للموظفين" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'تخصيص بنود المرتبات للموظفين' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] flex flex-col lg:flex-row items-end gap-3">
        <label class="flex flex-col gap-1 flex-1 w-full"><span class="field-label">الموظف</span>
          <input class="input" list="alloc-emps" [ngModel]="employee()" (ngModelChange)="employee.set($event)" placeholder="ابحث بالاسم أو الكود..." />
          <datalist id="alloc-emps">@for (e of employees(); track e) { <option [value]="e"></option> }</datalist>
        </label>
        <label class="flex flex-col gap-1 flex-1 w-full"><span class="field-label">المجموعة الرئيسية للبند</span>
          <select class="input" [ngModel]="group()" (ngModelChange)="group.set($event)">
            <option value="">الكل</option>@for (g of groups(); track g) { <option>{{ g }}</option> }
          </select>
        </label>
        <button type="button" class="btn-primary" (click)="toast.success('اختر بنداً من الجدول ثم فعّل التخصيص')"><app-icon name="plus" [size]="16" /> إضافة بند</button>
        <button *appCan="'salaries.edit'" type="button" class="btn-navy" [disabled]="saving()" (click)="save()"><app-icon name="save" [size]="16" /> {{ saving() ? 'جاري الحفظ...' : 'حفظ التخصيص' }}</button>
      </section>
      <section class="card">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="table-head"><tr>
              <th class="th">كود البند</th><th class="th">اسم البند</th><th class="th text-center">المجموعة الرئيسية للبند</th><th class="th text-center">طريقة الحساب</th>
              <th class="th text-center">قيمة البند</th><th class="th text-center">فعال</th>
              <th class="th text-center"><label class="inline-flex items-center gap-2"><input type="checkbox" class="checkbox" [ngModel]="allAllocated()" (ngModelChange)="allocateAll($event)" /> تخصيص</label></th>
              <th class="th text-center">إجراءات</th>
            </tr></thead>
            <tbody>
              @for (r of view(); track r.code) {
                @let ed = editing() === r.code;
                <tr class="border-b border-gray-100" [class]="ed ? 'bg-edit' : r.allocated ? 'bg-orange-50/60' : 'bg-white'">
                  <td class="td font-bold text-navy">{{ r.code }}</td>
                  <td class="td text-gray-800">{{ r.name }}</td>
                  <td class="td text-center"><span class="pill bg-white border border-gray-200 text-gray-600 font-normal">{{ r.group }}</span></td>
                  <td class="td text-center text-gray-500">
                    @if (ed) { <select class="input-sm" [(ngModel)]="d.calculation" aria-label="طريقة الحساب"><option>قيمة</option><option>نسبة</option></select> }
                    @else { {{ r.calculation || '—' }} }
                  </td>
                  <td class="td text-center">
                    @if (ed) { <input class="input-sm w-24 text-center" [(ngModel)]="d.value" aria-label="قيمة البند" /> }
                    @else { {{ r.value || '—' }} }
                  </td>
                  <td class="td text-center">
                    <button type="button" role="switch" [attr.aria-checked]="r.active" [disabled]="!r.allocated" (click)="patch(r, { active: !r.active })"
                      class="relative inline-block w-9 h-5 rounded-full transition-colors disabled:opacity-40" [class]="r.active ? 'bg-brand' : 'bg-gray-300'" aria-label="فعال">
                      <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" [style.right.px]="r.active ? 2 : 18"></span>
                    </button>
                  </td>
                  <td class="td text-center"><input type="checkbox" class="checkbox" [checked]="r.allocated" (change)="patch(r, { allocated: !r.allocated, active: !r.allocated && r.active })" aria-label="تخصيص" /></td>
                  <td class="td"><div class="flex justify-center gap-2">
                    @if (ed) {
                      <button type="button" class="icon-btn-save" (click)="confirm(r)" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="editing.set(null)" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    } @else {
                      <button type="button" class="icon-btn-delete" [disabled]="!r.allocated" (click)="patch(r, { allocated: false, active: false })" aria-label="إلغاء التخصيص"><app-icon name="delete" [size]="16" /></button>
                      <button type="button" class="icon-btn-edit" [disabled]="!r.allocated" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                    }
                  </div></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex justify-between px-5 py-3 text-sm text-gray-500">
          <span>تم تخصيص {{ allocated() }} من {{ items().length }} بنود، منها {{ active() }} فعالة</span>
          <span>الموظف: <b class="text-navy">{{ employeeName() }}</b></span>
        </div>
      </section>
    </main>
  `,
})
export class SalaryAllocation {
  private readonly svc = inject(SalariesService);
  protected readonly toast = inject(ToastService);
  protected readonly employees = toSignal(this.svc.allocationEmployees(), { initialValue: [] });
  protected readonly employee = signal('EMP-1024 — أحمد محمد علي');
  protected readonly employeeName = computed(() => this.employee().split('—')[1]?.trim() ?? this.employee());
  protected readonly group = signal('');
  protected readonly items = signal<EmployeeItem[]>([]);
  protected readonly groups = computed(() => [...new Set(this.items().map((i) => i.group))]);
  protected readonly view = computed(() => this.items().filter((i) => !this.group() || i.group === this.group()));
  protected readonly allocated = computed(() => this.items().filter((i) => i.allocated).length);
  protected readonly active = computed(() => this.items().filter((i) => i.active).length);
  protected readonly allAllocated = computed(() => this.view().every((i) => i.allocated));
  protected readonly editing = signal<string | null>(null);
  protected d = {} as EmployeeItem;

  constructor() { effect((onCleanup) => {
      const e = this.employee();
      this.items.set([]); this.editing.set(null);
      if (!e) return;
      const sub = this.svc.employeeItems(e).subscribe((r) => this.items.set(r));
      onCleanup(() => sub.unsubscribe()); // latest employee wins
    }); }
  patch(r: EmployeeItem, p: Partial<EmployeeItem>) { this.items.update((is) => is.map((i) => (i.code === r.code ? { ...i, ...p } : i))); }
  allocateAll(on: boolean) { const codes = new Set(this.view().map((v) => v.code)); this.items.update((is) => is.map((i) => (codes.has(i.code) ? { ...i, allocated: on, active: on && i.active } : i))); }
  edit(r: EmployeeItem) { this.d = { ...r }; this.editing.set(r.code); }
  confirm(r: EmployeeItem) { this.patch(r, { calculation: this.d.calculation, value: this.d.value }); this.editing.set(null); }
  protected readonly saving = signal(false);
  save() {
    if (this.saving() || !this.employee()) return;
    this.saving.set(true);
    this.svc.saveEmployeeItems(this.employee(), structuredClone(this.items())).subscribe({
      next: () => { this.saving.set(false); this.toast.success('تم حفظ التخصيص'); },
      error: () => this.saving.set(false),
    });
  }
}
