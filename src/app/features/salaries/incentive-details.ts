import { fmt, num } from '../../shared/util/num';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../shared/data/lookups.service';
import { IncentiveLine, IncentiveSheetDetails } from '../../shared/data/models';
import { SalariesService } from '../../shared/data/salaries.service';
import { Icon, IconName } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

const EMPTY: IncentiveSheetDetails = { serial: '53356', date: '', department: '', payType: '', ratio: '', totalEntitled: '', totalNet: '', notes: '', lines: [] };
const blankLine = (): IncentiveLine => ({ name: '', basic: '0.00', abstract: '0.00', duration: '0.00', ratio: '0.00', entitled: '', deductPct: '0.00', total: '', insurance: '***', tax: '0.00', net: '' });

/** Screens 09 (تفاصيل الصرفية) and 09b (كشف جديد, id = "new") – /salaries/incentives/:id. */
@Component({
  selector: 'app-incentive-details',
  imports: [PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="isNew() ? 'كشف جديد' : 'تفاصيل الصرفية'" backTo="/salaries/incentives"
      [breadcrumb]="[{ label: 'المرتبات' }, { label: 'كشوف حوافز', link: '/salaries/incentives' }, { label: 'تفاصيل الصرفية' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <!-- Sheet header -->
      <section class="card p-[17px] grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3">
        <div class="flex flex-col gap-1">
          <span class="field-label">مسلسل:</span>
          <b class="text-navy text-lg">{{ s().serial }}</b>
          @if (isNew()) { <span class="text-xs text-brand">رقم جديد – بيتولّد تلقائي</span> }
        </div>
        <label class="flex flex-col gap-1"><span class="field-label">التاريخ</span>
          <input type="date" class="input !bg-[#dfe7f2] !border-[#c3cede]" [(ngModel)]="s().date" /></label>
        <label class="flex flex-col gap-1"><span class="field-label">الإدارة</span>
          <select class="input" [(ngModel)]="s().department"><option value="">اختر...</option>@for (d of lk()?.departments ?? []; track d) { <option>{{ d }}</option> }@if (s().department && !(lk()?.departments ?? []).includes(s().department)) { <option>{{ s().department }}</option> }</select></label>
        <label class="flex flex-col gap-1"><span class="field-label">نوع الصرف</span>
          <select class="input" [(ngModel)]="s().payType"><option value="">اختر...</option>@for (d of lk()?.incentiveTypes ?? []; track d) { <option>{{ d }}</option> }@if (s().payType && !(lk()?.incentiveTypes ?? []).includes(s().payType)) { <option>{{ s().payType }}</option> }</select></label>

        <label class="flex flex-col gap-1"><span class="field-label">النسبة</span>
          <input class="input !bg-[#dfe7f2] !border-[#c3cede]" [(ngModel)]="s().ratio" placeholder="%" /></label>
        <div class="flex flex-col gap-1"><span class="field-label">في الفترة من / إلى</span>
          <div class="flex items-center gap-2">
            <input type="date" class="input !bg-[#dfe7f2] !border-[#c3cede]" aria-label="من" [(ngModel)]="periodFrom" />
            <span class="text-gray-400 text-sm">إلى</span>
            <input type="date" class="input !bg-[#dfe7f2] !border-[#c3cede]" aria-label="إلى" [(ngModel)]="periodTo" />
          </div>
        </div>
        <label class="flex flex-col gap-1"><span class="field-label">جملة المستحق (محسوب تلقائي)</span>
          <input class="input !bg-gray-100 font-bold text-navy" readonly [value]="totals().entitled" /></label>
        <label class="flex flex-col gap-1"><span class="field-label">جملة الصافي (محسوب تلقائي)</span>
          <input class="input !bg-gray-100 font-bold text-green-600" readonly [value]="totals().net" /></label>

        <label class="flex flex-col gap-1 md:col-span-4"><span class="field-label">ملاحظات</span>
          <input class="input" [(ngModel)]="s().notes" placeholder="اكتب ملاحظات الكشف..." /></label>
      </section>

      <!-- Actions -->
      <section class="flex flex-wrap gap-2 no-print">
        @for (a of actions; track a.key) {
          <button type="button" class="btn-outline !bg-white" (click)="action(a.key, a.label)"><app-icon [name]="a.icon" [size]="16" /> {{ a.label }}</button>
        }
        <button type="button" class="btn-primary" (click)="addLine()"><app-icon name="plus" [size]="16" /> إضافة موظف</button>
        <button type="button" class="btn-navy" (click)="saveSheet()"><app-icon name="save" [size]="16" /> حفظ الكشف</button>
      </section>

      <!-- Lines -->
      <section class="card">
        <nav class="flex px-4 border-b border-gray-100" role="tablist">
          @for (t of ['بيان المستحق', 'اقساط مخصومه']; track t; let i = $index) {
            <button type="button" role="tab" class="px-4 h-11 text-sm border-b-2" [attr.aria-selected]="tab() === i" (click)="tab.set(i)"
              [class]="tab() === i ? 'border-brand text-brand font-bold' : 'border-transparent text-gray-500'">{{ t }}</button>
          }
        </nav>
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head"><tr>
              @for (c of cols; track c) { <th class="th">{{ c }}</th> }
              <th class="th text-center">الإجراءات</th>
            </tr></thead>
            <tbody>
              @for (l of pageRows(); track $index; let i = $index) {
                @if (editIdx() === l) {
                  <tr class="row-edit">
                    <td class="td"><input class="input-sm w-48" [(ngModel)]="draft.name" aria-label="الاسم" /></td>
                    <td class="td"><input class="input-sm w-20" [(ngModel)]="draft.basic" aria-label="الأساسي" /></td>
                    <td class="td"><input class="input-sm w-20" [(ngModel)]="draft.abstract" aria-label="المجرد" /></td>
                    <td class="td"><input class="input-sm w-20" [(ngModel)]="draft.duration" aria-label="المدة" /></td>
                    <td class="td"><input class="input-sm w-20" [(ngModel)]="draft.ratio" aria-label="النسبة" /></td>
                    <td class="td"><input class="input-sm w-24" [(ngModel)]="draft.entitled" aria-label="المستحق" /></td>
                    <td class="td text-gray-400">{{ draft.deductPct }}</td>
                    <td class="td font-bold text-navy">{{ draft.entitled }}</td>
                    <td class="td text-red-500">{{ draft.insurance }}</td>
                    <td class="td text-gray-400">{{ draft.tax }}</td>
                    <td class="td font-bold text-green-600">{{ draft.entitled }}</td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-save" (click)="saveLine()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                      <button type="button" class="icon-btn-cancel" (click)="cancelLine()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                    </div></td>
                  </tr>
                } @else {
                  <tr>
                    <td class="td font-semibold text-gray-800">{{ l.name }}</td>
                    <td class="td text-gray-400">{{ l.basic }}</td><td class="td text-gray-400">{{ l.abstract }}</td>
                    <td class="td text-gray-400">{{ l.duration }}</td><td class="td text-gray-400">{{ l.ratio }}</td>
                    <td class="td text-gray-600">{{ l.entitled }}</td><td class="td text-gray-400">{{ l.deductPct }}</td>
                    <td class="td font-bold text-navy">{{ l.total }}</td><td class="td text-red-500">{{ l.insurance }}</td>
                    <td class="td text-gray-400">{{ l.tax }}</td><td class="td font-bold text-green-600">{{ l.net }}</td>
                    <td class="td"><div class="flex justify-center gap-2">
                      <button type="button" class="icon-btn-edit" (click)="edit(l)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                      <button type="button" class="icon-btn-delete" (click)="removeLine(l)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                    </div></td>
                  </tr>
                }
              } @empty {
                <tr><td [attr.colspan]="cols.length + 1" class="py-14 text-center">
                  <p class="text-navy font-bold">الكشف لسه فاضي</p>
                  <p class="text-xs text-gray-500 mt-1">حمّل الموظفين بأحد أزرار التحميل اللي فوق، أو اضغط "إضافة موظف" عشان تضيف موظف بإيدك</p>
                </td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="flex items-center justify-between px-5 py-3 text-sm text-gray-500">
          <span>عرض {{ pageRows().length }} من {{ s().lines.length }} سجلاً</span>
          <div class="flex gap-2">
            <button type="button" class="btn-outline !px-3 !py-1.5" [disabled]="page() <= 1" (click)="page.set(page() - 1)">السابق</button>
            <span class="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center">{{ page() }}</span>
            <button type="button" class="btn-outline !px-3 !py-1.5" [disabled]="page() * 10 >= s().lines.length" (click)="page.set(page() + 1)">التالي</button>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class IncentiveDetails {
  readonly id = input.required<string>();
  private readonly svc = inject(SalariesService);
  private readonly toast = inject(ToastService);
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly isNew = computed(() => this.id() === 'new');
  protected readonly s = signal<IncentiveSheetDetails>(structuredClone(EMPTY));
  protected readonly tab = signal(0);
  protected readonly page = signal(1);
  protected readonly editIdx = signal<IncentiveLine | null>(null);
  protected draft = blankLine();
  protected periodFrom = '';
  protected periodTo = '';
  protected readonly cols = ['الاسم', 'الأساسي', 'المجرد', 'المدة', 'النسبه', 'المستحق', 'ض. محمله %', 'جملة المستحق', 'معاشات %', 'ضريبه %', 'الصافي'];
  protected readonly actions: { key: string; label: string; icon: IconName }[] = [
    { key: 'load-current-basic', label: 'تحميل الموظفين بالادارة واساسيهم الحالي', icon: 'users' },
    { key: 'load-previous-basic', label: 'تحميل الموظفين بالادارة واساسيهم السابق', icon: 'clock' },
    { key: 'basic-salaries', label: 'مرتبات اساسيه', icon: 'file' },
    { key: 'refresh-employees', label: 'تحديث بيانات الموظفين', icon: 'refresh' },
  ];
  protected readonly pageRows = computed(() => this.s().lines.slice((this.page() - 1) * 10, this.page() * 10));
  protected readonly totals = computed(() => {
    const n = num;
    const sum = this.s().lines.reduce((a, l) => a + n(l.net), 0);
    if (!this.s().lines.length) return { entitled: '0.00', net: '0.00' };
    const f = fmt(sum, 2);
    return { entitled: this.isNew() ? f : this.s().totalEntitled, net: this.isNew() ? f : this.s().totalNet };
  });

  constructor() {
    effect(() => {
      if (this.isNew()) { this.s.set(structuredClone(EMPTY)); return; }
      this.svc.incentiveSheet(this.id()).subscribe((d) => this.s.set(d));
    });
  }

  protected edit(l: IncentiveLine) { this.draft = { ...l }; this.editIdx.set(l); }
  protected addLine() {
    const l = blankLine();
    this.s.update((s) => ({ ...s, lines: [l, ...s.lines] }));
    this.page.set(1);
    this.edit(l);
  }
  protected saveLine() {
    const old = this.editIdx()!;
    if (!this.draft.name.trim()) { this.toast.error('برجاء إدخال اسم الموظف'); return; }
    const l = { ...this.draft, total: this.draft.entitled, net: this.draft.entitled };
    this.s.update((s) => ({ ...s, lines: s.lines.map((x) => (x === old ? l : x)) }));
    this.editIdx.set(null);
  }
  protected cancelLine() {
    const old = this.editIdx()!;
    if (!old.name) this.s.update((s) => ({ ...s, lines: s.lines.filter((x) => x !== old) }));
    this.editIdx.set(null);
  }
  protected removeLine(l: IncentiveLine) { this.s.update((s) => ({ ...s, lines: s.lines.filter((x) => x !== l) })); }
  protected action(key: string, label: string) {
    this.svc.incentiveAction(this.id(), key).subscribe(() => this.toast.success(`تم: ${label}`));
  }
  protected saveSheet() {
    this.svc.saveIncentiveSheet(this.id(), this.s()).subscribe(() => this.toast.success('تم حفظ الكشف'));
  }
}
