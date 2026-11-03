import { ConfirmService } from '../../shared/ui/confirm';
import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PeriodicAllowanceRow } from '../../shared/data/models';
import { SettingsService } from '../../shared/data/settings.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { ToastService } from '../../shared/ui/toast';
import { exportCsv, printPage } from '../../shared/util/export';
import { SettingsPills } from './settings-pills';

/** Screen 28 – نسبة العلاوة الدورية (/settings/periodic-allowance). Date-range toolbar + "تحديث النسب". */
@Component({
  selector: 'app-settings-periodic-allowance',
  imports: [AppDatePipe, PageHeader, Icon, FormsModule, Pagination, SettingsPills],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="نسبة العلاوة الدورية" [breadcrumb]="[{ label: 'الإعدادات', link: '/settings/system' }, { label: 'نسبة العلاوة الدورية' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <app-settings-pills [active]="15" />
      <section class="card p-[13px] flex flex-wrap items-center gap-2">
        <label class="relative flex-1 min-w-[200px]">
          <app-icon name="search" [size]="15" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input class="input !pr-9" placeholder="ابحث باسم الموظف..." [ngModel]="q()" (ngModelChange)="q.set($event); page.set(1)" />
        </label>
        <label class="flex items-center gap-2 border border-gray-200 rounded-lg px-3 text-sm text-gray-500">من تاريخ <input type="date" class="py-2" [(ngModel)]="from" /></label>
        <label class="flex items-center gap-2 border border-gray-200 rounded-lg px-3 text-sm text-gray-500">إلى تاريخ <input type="date" class="py-2" [(ngModel)]="to" /></label>
        <button type="button" class="btn-primary" (click)="refresh()"><app-icon name="refresh" [size]="16" /> تحديث النسب</button>
        <button type="button" class="btn-outline" (click)="export()"><app-icon name="file" [size]="16" /> تصدير Excel</button>
        <button type="button" class="btn-outline" (click)="print()"><app-icon name="print" [size]="16" /> طباعة</button>
      </section>
      <section class="card">
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr><th class="th">اسم الموظف</th><th class="th">تاريخ العلاوة الدورية</th><th class="th">نسبة العلاوة الدورية</th><th class="th text-center w-32">إجراءات</th></tr></thead>
            <tbody>
              @for (r of paged(); track $index) {
                @if (editing() === r) {
                  <tr class="row-edit">
                    <td class="td">{{ r.name }}</td>
                    <td class="td"><input class="input-sm w-32" [(ngModel)]="d.date" aria-label="التاريخ" /></td>
                    <td class="td"><input class="input-sm w-20" [(ngModel)]="d.rate" aria-label="النسبة" /></td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-save" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="editing.set(null)" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td>
                  </tr>
                } @else {
                  <tr>
                    <td class="td text-gray-800">{{ r.name }}</td><td class="td text-gray-500">{{ r.date | appDate }}</td><td class="td">{{ r.rate }}</td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-delete" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                      <button type="button" class="icon-btn-edit" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                    </div></td>
                  </tr>
                }
              } @empty { <tr><td colspan="4" class="py-10 text-center text-sm text-gray-400">لا توجد بيانات</td></tr> }
            </tbody>
          </table>
        </div>
        <app-pagination [(page)]="page" [(pageSize)]="size" [total]="view().length" />
      </section>
    </main>
  `,
})
export class SettingsPeriodicAllowance {
  private readonly dialog = inject(ConfirmService);
  private readonly svc = inject(SettingsService);
  private readonly toast = inject(ToastService);
  protected readonly rows = signal<PeriodicAllowanceRow[]>([]);
  protected readonly q = signal('');
  protected readonly page = signal(1);
  protected readonly size = signal(10);
  protected readonly editing = signal<PeriodicAllowanceRow | null>(null);
  protected readonly view = computed(() => this.rows().filter((r) => r.name.includes(this.q().trim())));
  protected readonly paged = computed(() => this.view().slice((this.page() - 1) * this.size(), this.page() * this.size()));
  protected from = '2026-06-30';
  protected to = '2026-06-30';
  protected d = {} as PeriodicAllowanceRow;

  constructor() { this.load(); }
  private load() { this.svc.periodicAllowance({ from: this.from, to: this.to }).subscribe((r) => this.rows.set(r)); }
  refresh() { this.svc.refreshPeriodicAllowance({ from: this.from, to: this.to }).subscribe(() => { this.load(); this.toast.success('تم تحديث النسب'); }); }
  edit(r: PeriodicAllowanceRow) { this.d = { ...r }; this.editing.set(r); }
  save() { const old = this.editing(); this.rows.update((rs) => rs.map((r) => (r === old ? { ...this.d } : r))); this.editing.set(null); this.toast.success('تم الحفظ'); }
  async remove(r: PeriodicAllowanceRow) { if (await this.dialog.ask(`حذف ${r.name}؟`)) this.rows.update((rs) => rs.filter((x) => x !== r)); }
  export() { exportCsv('نسبة-العلاوة-الدورية', ['اسم الموظف', 'التاريخ', 'النسبة'], this.view().map((r) => [r.name, r.date, r.rate])); }
  print() { printPage(); }
}
