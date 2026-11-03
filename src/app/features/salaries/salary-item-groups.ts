import { ConfirmService } from '../../shared/ui/confirm';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SalaryItemGroup } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

/** Screen 12 – المجموعات الرئيسية لبنود المرتبات (/salaries/item-groups). Inline add/edit (state S6). */
@Component({
  selector: 'app-salary-item-groups',
  imports: [PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="المجموعات الرئيسية لبنود المرتبات" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'المجموعات الرئيسية لبنود المرتبات' }]" />
    <main class="p-[13px] flex justify-center">
      <section class="card w-full max-w-[900px]">
        <div class="flex flex-col-reverse sm:flex-row gap-3 p-[17px]">
          <label class="relative flex-1">
            <app-icon name="search" [size]="16" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input class="input !pr-9" placeholder="ابحث باسم المجموعة أو كود المجموعة..." [ngModel]="q()" (ngModelChange)="q.set($event); page.set(1)" />
          </label>
          <button type="button" class="btn-primary" (click)="add()" [disabled]="editing() !== null"><app-icon name="plus" [size]="16" /> إضافة مجموعة جديدة</button>
        </div>
        <table class="w-full text-sm zebra-table">
          <thead class="table-head"><tr><th class="th w-40">كود المجموعة</th><th class="th">اسم المجموعة</th><th class="th text-center w-32">الإجراءات</th></tr></thead>
          <tbody>
            @for (g of paged(); track g) {
              @if (editing() === g) {
                <tr class="row-edit">
                  <td class="td"><input class="input-sm w-24" [(ngModel)]="d.code" [readOnly]="!isNew" aria-label="كود المجموعة" /></td>
                  <td class="td"><input class="input-sm w-full" [(ngModel)]="d.name" aria-label="اسم المجموعة" /></td>
                  <td class="td"><div class="flex justify-center gap-2">
                    <button type="button" class="icon-btn-save" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                    <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                  </div></td>
                </tr>
              } @else {
                <tr>
                  <td class="td font-bold text-navy">{{ g.code }}</td><td class="td">{{ g.name }}</td>
                  <td class="td"><div class="flex justify-center gap-2">
                    <button type="button" class="icon-btn-delete" (click)="remove(g)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                    <button type="button" class="icon-btn-edit" (click)="edit(g)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                  </div></td>
                </tr>
              }
            } @empty { <tr><td colspan="3" class="py-10 text-center text-sm text-gray-400">لا توجد مجموعات مطابقة</td></tr> }
          </tbody>
        </table>
        <div class="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm text-gray-500">
          <span>عرض {{ paged().length }} من {{ filtered().length }} مجموعات</span>
          <div class="flex items-center gap-2">
            <span>عدد السجلات في الصفحة</span>
            <select class="border border-gray-200 rounded-lg px-2 py-1" [ngModel]="size()" (ngModelChange)="size.set(+$event); page.set(1)">@for (s of [10, 25, 50]; track s) { <option [ngValue]="s">{{ s }}</option> }</select>
            <button type="button" class="icon-btn border-gray-200" [disabled]="page() <= 1" (click)="page.set(page() - 1)" aria-label="السابق">‹</button>
            <span class="icon-btn bg-navy text-white border-navy">{{ page() }}</span>
            <button type="button" class="icon-btn border-gray-200" [disabled]="page() * size() >= filtered().length" (click)="page.set(page() + 1)" aria-label="التالي">›</button>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class SalaryItemGroups {
  private readonly dialog = inject(ConfirmService);
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  protected readonly rows = signal<SalaryItemGroup[]>([]);
  protected readonly q = signal('');
  protected readonly page = signal(1);
  protected readonly size = signal(10);
  protected readonly editing = signal<SalaryItemGroup | null>(null);
  protected readonly filtered = computed(() => this.rows().filter((g) => !this.q() || g.name.includes(this.q()) || g.code.includes(this.q())));
  protected readonly paged = computed(() => this.filtered().slice((this.page() - 1) * this.size(), this.page() * this.size()));
  protected d: SalaryItemGroup = { code: '', name: '' };
  protected isNew = false;

  constructor() { this.svc.groups().subscribe((g) => this.rows.set(g)); }
  edit(g: SalaryItemGroup) { this.isNew = false; this.d = { ...g }; this.editing.set(g); }
  add() {
    const g = { code: String(this.rows().length + 1).padStart(3, '0'), name: '' };
    this.rows.update((r) => [g, ...r]); this.q.set(''); this.page.set(1);
    this.edit(g); this.isNew = true;
  }
  cancel() { if (this.isNew) this.rows.update((r) => r.filter((x) => x !== this.editing())); this.editing.set(null); }
  save() {
    if (!this.d.name.trim()) { this.toast.error('برجاء إدخال اسم المجموعة'); return; }
    const old = this.editing();
    this.svc.saveGroup(this.d, this.isNew).subscribe(() => {
      this.rows.update((r) => r.map((x) => (x === old ? { ...this.d } : x))); this.editing.set(null); this.toast.success('تم الحفظ');
    });
  }
  async remove(g: SalaryItemGroup) {
    if (!(await this.dialog.ask(`حذف المجموعة ${g.name}؟`))) return;
    this.svc.deleteGroup(g.code).subscribe(() => { this.rows.update((r) => r.filter((x) => x !== g)); this.toast.success('تم الحذف'); });
  }
}
