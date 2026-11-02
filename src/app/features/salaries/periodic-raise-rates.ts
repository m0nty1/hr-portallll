import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../shared/data/lookups.service';
import { EmployeeRate } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { SelectField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

/** Screen 22 – تحديد نسبة العلاوة الدورية (/salaries/periodic-raise). Name filter + inline add (S7), navy pagination. */
@Component({
  selector: 'app-periodic-raise-rates',
  imports: [PageHeader, SelectField, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="تحديد نسبة العلاوة الدورية" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'تحديد نسبة العلاوة الدورية' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] w-full md:max-w-[480px]">
        <app-select-field label="العام المالي" [options]="lk()?.fiscalYears ?? []" [(value)]="year" />
      </section>
      <section class="card">
        <div class="flex flex-col sm:flex-row items-end justify-between gap-3 p-[17px]">
          <label class="flex flex-col gap-1 w-full sm:max-w-[300px]"><span class="field-label">بحث بالاسم</span>
            <select class="input" [ngModel]="filter()" (ngModelChange)="filter.set($event); page.set(1)">
              <option value="">كل الموظفين</option>@for (r of rows(); track r.id) { <option>{{ r.name }}</option> }
            </select>
          </label>
          <button type="button" class="btn-primary" [disabled]="editing() !== null" (click)="add()"><app-icon name="plus" [size]="16" /> إضافة موظف</button>
        </div>
        <table class="w-full text-sm zebra-table">
          <thead class="table-head"><tr><th class="th">اسم الموظف</th><th class="th text-center">نسبة العلاوة الدورية</th><th class="th text-center w-32">إجراءات</th></tr></thead>
          <tbody>
            @for (r of paged(); track r.id) {
              @if (editing() === r.id) {
                <tr class="row-edit">
                  <td class="td">
                    @if (isNew) {
                      <select class="input-sm w-full max-w-xs" [(ngModel)]="d.name" aria-label="اسم الموظف"><option value="">اختر الموظف...</option>@for (e of candidates(); track e) { <option>{{ e }}</option> }</select>
                    } @else { {{ r.name }} }
                  </td>
                  <td class="td text-center"><input class="input-sm w-20 text-center" type="number" min="0" max="100" [(ngModel)]="d.percentage" aria-label="النسبة" /> %</td>
                  <td class="td"><div class="flex justify-center gap-2">
                    <button type="button" class="icon-btn-save" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                    <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                  </div></td>
                </tr>
              } @else {
                <tr>
                  <td class="td text-gray-800">{{ r.name }}</td>
                  <td class="td text-center"><span class="inline-block bg-white border border-gray-200 rounded-md px-2.5 py-0.5 text-xs font-bold">{{ r.percentage }}%</span></td>
                  <td class="td"><div class="flex justify-center gap-2">
                    <button type="button" class="icon-btn-delete" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                    <button type="button" class="icon-btn-edit" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                  </div></td>
                </tr>
              }
            }
          </tbody>
        </table>
        <div class="flex items-center justify-between px-5 py-3 text-sm text-gray-500">
          <span>عرض {{ paged().length }} من {{ view().length }} موظفين</span>
          <div class="flex gap-2">
            <button type="button" class="icon-btn border-gray-200" [disabled]="page() <= 1" (click)="page.set(page() - 1)" aria-label="السابق">‹</button>
            <span class="icon-btn bg-navy border-navy text-white">{{ page() }}</span>
            <button type="button" class="icon-btn border-gray-200" [disabled]="page() * 10 >= view().length" (click)="page.set(page() + 1)" aria-label="التالي">›</button>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class PeriodicRaiseRates {
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  private readonly allEmployees = toSignal(this.svc.rateEmployees(), { initialValue: [] });
  protected readonly year = signal('2026/2027');
  protected readonly rows = signal<EmployeeRate[]>([]);
  protected readonly filter = signal('');
  protected readonly page = signal(1);
  protected readonly editing = signal<number | null>(null);
  protected readonly view = computed(() => this.rows().filter((r) => !this.filter() || r.name === this.filter() || r.id === this.editing()));
  protected readonly paged = computed(() => this.view().slice((this.page() - 1) * 10, this.page() * 10));
  protected readonly candidates = computed(() => this.allEmployees().filter((e) => !this.rows().some((r) => r.name === e)));
  protected d: EmployeeRate = { id: 0, name: '', percentage: '' };
  protected isNew = false;

  constructor() { effect(() => this.svc.rates(this.year()).subscribe((r) => this.rows.set(r))); }
  edit(r: EmployeeRate) { this.isNew = false; this.d = { ...r }; this.editing.set(r.id); }
  add() {
    const r = { id: -Date.now(), name: '', percentage: '10' };
    this.rows.update((rs) => [r, ...rs]); this.page.set(1);
    this.edit(r); this.isNew = true;
  }
  cancel() { if (this.isNew) this.rows.update((rs) => rs.filter((r) => r.id !== this.editing())); this.editing.set(null); }
  save() {
    if (!this.d.name) { this.toast.error('برجاء اختيار الموظف'); return; }
    this.svc.saveRate(this.year(), this.d).subscribe(() => {
      this.rows.update((rs) => rs.map((r) => (r.id === this.d.id ? { ...this.d } : r))); this.editing.set(null); this.toast.success('تم الحفظ');
    });
  }
  remove(r: EmployeeRate) {
    if (!confirm(`حذف ${r.name}؟`)) return;
    this.svc.deleteRate(r.id).subscribe(() => { this.rows.update((rs) => rs.filter((x) => x.id !== r.id)); this.toast.success('تم الحذف'); });
  }
}
