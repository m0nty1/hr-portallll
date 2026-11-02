import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CodeName } from '../../shared/data/models';
import { SettingsService } from '../../shared/data/settings.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';
import { exportCsv, printPage } from '../../shared/util/export';
import { SettingsPills } from './settings-pills';

interface Block { key: 'disb' | 'excel' | 'tax'; title: string; nameCol: string; rows: () => CodeName[] | undefined; }

/** Screen 27 – مجموعات الصرفيات والضرائب والاكسل (/settings/disbursement-groups). 3 side-by-side tables. */
@Component({
  selector: 'app-settings-disbursement-groups',
  imports: [PageHeader, Icon, FormsModule, SettingsPills],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="مجموعات الصرفيات والضرائب والاكسل" [breadcrumb]="[{ label: 'الإعدادات', link: '/settings/system' }, { label: 'مجموعات الصرفيات والضرائب' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <app-settings-pills [active]="16" />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-[11px] items-start">
        @for (b of blocks; track b.key) {
          <section class="card-plain">
            <h2 class="bg-navy text-white font-bold px-4 py-3">{{ b.title }}</h2>
            <table class="w-full text-sm">
              <thead class="bg-navy text-blue-100 text-xs"><tr><th class="th w-28">كود المجموعة</th><th class="th">{{ b.nameCol }}</th></tr></thead>
              <tbody>
                @for (r of b.rows() ?? []; track r.code) {
                  <tr class="border-b border-gray-100 cursor-pointer" [class.bg-edit]="sel()?.key === b.key && sel()?.code === r.code" (click)="sel.set({ key: b.key, code: r.code })">
                    <td class="td text-gray-500">{{ r.code }}</td><td class="td">{{ r.name }}</td>
                  </tr>
                }
                @if (adding() === b.key) {
                  <tr class="bg-edit"><td class="td text-gray-400">جديد</td>
                    <td class="td"><div class="flex gap-2">
                      <input class="input-sm flex-1" [(ngModel)]="newName" aria-label="اسم المجموعة" (keydown.enter)="save(b)" />
                      <button type="button" class="icon-btn-save" (click)="save(b)" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="adding.set(null)" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td></tr>
                }
              </tbody>
            </table>
          </section>
        }
      </div>
      <section class="card flex flex-wrap items-center justify-between gap-2 p-[13px]">
        <div class="flex gap-2">
          <div class="relative">
            <button type="button" class="btn-primary" (click)="menu.set(!menu())"><app-icon name="plus" [size]="16" /> إضافة مجموعة</button>
            @if (menu()) {
              <div class="absolute bottom-full mb-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                @for (b of blocks; track b.key) { <button type="button" class="block w-full text-right px-3 py-2 text-sm hover:bg-orange-50" (click)="startAdd(b.key)">{{ b.title }}</button> }
              </div>
            }
          </div>
          <button type="button" class="btn-outline" (click)="export()"><app-icon name="file" [size]="16" /> تصدير الاكسل</button>
          <button type="button" class="btn-outline" (click)="print()"><app-icon name="print" [size]="16" /> طباعة</button>
        </div>
        <span class="text-xs text-gray-500">عرض {{ tax().length }} سجلاً</span>
      </section>
    </main>
  `,
})
export class SettingsDisbursementGroups {
  private readonly svc = inject(SettingsService);
  private readonly toast = inject(ToastService);
  private readonly disb = signal<CodeName[]>([]);
  private readonly excel = signal<CodeName[]>([]);
  protected readonly tax = signal<CodeName[]>([]);
  protected readonly sel = signal<{ key: string; code: number } | null>(null);
  protected readonly adding = signal<Block['key'] | null>(null);
  protected readonly menu = signal(false);
  protected newName = '';
  protected readonly blocks: Block[] = [
    { key: 'disb', title: 'مجموعات الصرفيات', nameCol: 'اسم مجموعة الصرفيات', rows: this.disb },
    { key: 'excel', title: 'مجموعات الاكسل', nameCol: 'اسم مجموعة الاكسل', rows: this.excel },
    { key: 'tax', title: 'المجموعات الضريبية', nameCol: 'اسم المجموعة الضريبية', rows: this.tax },
  ];

  constructor() {
    this.svc.disbursementGroups().subscribe((r) => this.disb.set(r));
    this.svc.excelGroups().subscribe((r) => this.excel.set(r));
    this.svc.taxGroups().subscribe((r) => this.tax.set(r));
  }
  private sig(k: Block['key']) { return { disb: this.disb, excel: this.excel, tax: this.tax }[k]; }
  startAdd(k: Block['key']) { this.menu.set(false); this.newName = ''; this.adding.set(k); }
  save(b: Block) {
    if (!this.newName.trim()) { this.toast.error('برجاء إدخال الاسم'); return; }
    const s = this.sig(b.key);
    s.update((r) => [...r, { code: Math.max(0, ...r.map((x) => x.code)) + 1, name: this.newName.trim() }]);
    this.adding.set(null);
    this.toast.success('تمت الإضافة');
  }
  export() {
    const rows = this.blocks.flatMap((b) => (b.rows() ?? []).map((r) => [b.title, r.code, r.name] as (string | number)[]));
    exportCsv('مجموعات-الصرفيات', ['الجدول', 'الكود', 'الاسم'], rows);
  }
  print() { printPage(); }
}
