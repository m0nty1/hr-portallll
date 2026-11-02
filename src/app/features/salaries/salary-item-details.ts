import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ItemDependency } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';
import { ItemTypePill } from './item-type-pill';

/** Screen 13 – تفاصيل بند المرتب (/salaries/items/:code). */
@Component({
  selector: 'app-salary-item-details',
  imports: [PageHeader, Icon, FormsModule, ItemTypePill],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="تفاصيل بند المرتب" backTo="/salaries/items"
      [breadcrumb]="[{ label: 'المرتبات' }, { label: 'بنود المرتبات', link: '/salaries/items' }, { label: 'تفاصيل البند' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1"><span class="field-label">كود البند</span><input class="input !bg-gray-100 font-bold text-navy" readonly [value]="code()" /></label>
        <label class="flex flex-col gap-1"><span class="field-label">اسم البند</span><input class="input !bg-gray-100" readonly [value]="item()?.name ?? ''" /></label>
      </section>
      <section class="card">
        <div class="flex justify-between items-center px-5 py-3">
          <h2 class="font-bold text-navy">البنود المعتمد عليها</h2>
          <span class="text-xs text-gray-400">{{ deps().length }} بنود</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr><th class="th">كود البند</th><th class="th">اسم البند</th><th class="th text-center">نوع البند</th><th class="th text-center">كود ترتيب البند</th><th class="th text-center">إجراءات</th></tr></thead>
            <tbody>
              @for (r of deps(); track $index) {
                @if (r.code === '') {
                  <tr class="row-edit">
                    <td class="td" colspan="3"><select class="input-sm w-full" [(ngModel)]="pick" aria-label="اختر البند">
                      <option value="">اختر البند...</option>
                      @for (i of available(); track i.code) { <option [value]="i.code">{{ i.code }} — {{ i.name }}</option> }
                    </select></td>
                    <td class="td"><input class="input-sm w-20 text-center mx-auto block" [(ngModel)]="order" aria-label="كود الترتيب" /></td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-save" (click)="confirmAdd()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="removeAt($index)" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td>
                  </tr>
                } @else {
                  <tr>
                    <td class="td font-bold text-navy">{{ r.code }}</td><td class="td">{{ r.name }}</td>
                    <td class="td text-center"><app-item-type-pill [type]="r.type" /></td>
                    <td class="td text-center font-bold text-navy">{{ r.order }}</td>
                    <td class="td text-center"><button type="button" class="icon-btn-delete mx-auto" (click)="removeAt($index)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button></td>
                  </tr>
                }
              } @empty {
                <tr><td colspan="5" class="py-10 text-center text-sm text-gray-400">لا توجد بنود معتمد عليها</td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex justify-between items-center px-5 py-3">
          <span class="text-sm text-gray-500">عرض {{ deps().length }} من {{ deps().length }} بنود</span>
          <button type="button" class="btn-primary" (click)="add()"><app-icon name="plus" [size]="16" /> إضافة بند</button>
        </div>
      </section>
    </main>
  `,
})
export class SalaryItemDetails {
  readonly code = input.required<string>();
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  private readonly items = toSignal(this.svc.items(''), { initialValue: [] });
  protected readonly item = computed(() => this.items().find((i) => i.code === this.code()));
  protected readonly deps = signal<ItemDependency[]>([]);
  protected readonly available = computed(() => this.items().filter((i) => !this.deps().some((d) => d.code === i.code) && i.code !== this.code()));
  protected pick = '';
  protected order = '';

  constructor() { effect(() => this.svc.itemDependencies(this.code()).subscribe((d) => this.deps.set(d))); }

  add() {
    if (this.deps().some((d) => d.code === '')) return;
    this.pick = ''; this.order = String(this.deps().length + 1).padStart(2, '0');
    this.deps.update((d) => [...d, { code: '', name: '', type: 'استحقاق', order: '' }]);
  }
  confirmAdd() {
    const i = this.items().find((x) => x.code === this.pick);
    if (!i) { this.toast.error('برجاء اختيار البند'); return; }
    const next = this.deps().map((d) => (d.code === '' ? { code: i.code, name: i.name, type: i.type, order: this.order } : d));
    this.persist(next);
  }
  removeAt(i: number) {
    const wasDraft = this.deps()[i].code === '';
    const next = this.deps().filter((_, j) => j !== i);
    wasDraft ? this.deps.set(next) : this.persist(next);
  }
  private persist(next: ItemDependency[]) {
    this.svc.saveDependencies(this.code(), next).subscribe(() => { this.deps.set(next); this.toast.success('تم الحفظ'); });
  }
}
