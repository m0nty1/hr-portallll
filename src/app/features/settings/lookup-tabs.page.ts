import { ConfirmService } from '../../shared/ui/confirm';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api/api.service';
import { MockLookupStore } from '../../shared/data/lookup-store';
import { LookupsService } from '../../shared/data/lookups.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';
import { HR_TABS, LookupTab, SALARY_TABS } from '../../shared/data/lookup-tables';

type Row = Record<string, string | boolean | number>;

/**
 * Screens 31 (إعدادات الموارد البشرية) and 32 (إعدادات المرتبات والحوافز):
 * a tab strip of lookup tables, each with search, inline add/edit/delete and paging.
 * Route data: { group: 'hr' | 'salary', title }. Active tab is kept in ?tab=<slug>.
 */
@Component({
  selector: 'app-lookup-tabs-page',
  imports: [FormsModule, Icon, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="title()" [breadcrumb]="[{ label: 'الإعدادات', link: '/settings' }, { label: title() }]" />
    <main class="p-[13px]">
      <section class="card">
        <!-- Tabs -->
        <nav class="flex flex-wrap px-4 pt-3 border-b border-gray-100" role="tablist">
          @for (t of tabs(); track t.slug) {
            <button type="button" role="tab" [attr.aria-selected]="t.slug === current().slug" (click)="select(t.slug)"
              class="px-4 h-12 text-[15px] whitespace-nowrap border-b-2 transition-colors"
              [class]="t.slug === current().slug ? 'border-brand text-brand font-bold' : 'border-transparent text-gray-500 hover:text-navy'">
              {{ t.tab }}
            </button>
          }
        </nav>

        <!-- Toolbar -->
        <div class="flex flex-col-reverse sm:flex-row items-stretch gap-3 px-5 py-[18px]">
          <label class="relative flex-1">
            <app-icon name="search" [size]="16" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input class="input !h-12 !pr-10" [placeholder]="current().search" [ngModel]="q()" (ngModelChange)="q.set($event); page.set(1)" />
          </label>
          <button type="button" class="btn-primary !h-12" (click)="add()" [disabled]="editing() !== null">
            <app-icon name="plus" [size]="16" /> {{ current().add }}
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm zebra-table">
            <thead class="table-head">
              <tr>
                @for (c of current().cols; track c.key) { <th class="th" [style.min-width.px]="c.w / 2.2">{{ c.label }}</th> }
                <th class="th text-center w-[150px]">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              @for (r of paged(); track $index; let i = $index) {
                @let editRow = editing() === r;
                <tr [class.row-edit]="editRow" [style.background]="editRow ? 'var(--color-edit)' : null">
                  @for (c of current().cols; track c.key) {
                    <td class="td" [class.font-bold]="c.type === 'key'">
                      @if (c.type === 'check') {
                        @if (editRow) { <input type="checkbox" class="checkbox" [(ngModel)]="draft()[c.key]" [attr.aria-label]="c.label" /> }
                        @else { <input type="checkbox" class="checkbox" [checked]="r[c.key]" disabled [attr.aria-label]="c.label" /> }
                      } @else if (editRow && (c.type !== 'key' || isNew())) {
                        @if (c.type === 'select') {
                          <select class="input !py-1.5" [(ngModel)]="draft()[c.key]">
                            @for (o of c.options; track o) { <option [value]="o">{{ o }}</option> }
                          </select>
                        } @else {
                          <input class="input !py-1.5" [(ngModel)]="draft()[c.key]" [attr.aria-label]="c.label" />
                        }
                      } @else {
                        {{ r[c.key] }}
                      }
                    </td>
                  }
                  <td class="td">
                    <div class="flex items-center justify-center gap-2">
                      @if (editRow) {
                        <button type="button" class="icon-btn-save" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                        <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                      } @else {
                        <button type="button" class="icon-btn-delete" (click)="remove(r)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                        <button type="button" class="icon-btn-edit" (click)="edit(r)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td class="td text-center text-gray-400 py-10" [attr.colspan]="current().cols.length + 1">لا توجد بيانات مطابقة</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-[14px] text-sm text-gray-500">
          <span>عرض {{ paged().length }} من {{ filtered().length }} سجل</span>
          <div class="flex items-center gap-2">
            <span>عدد السجلات في الصفحة</span>
            <select class="border border-gray-200 rounded-lg py-1.5 px-3 bg-white" [ngModel]="size()" (ngModelChange)="size.set(+$event); page.set(1)">
              @for (s of [10, 25, 50]; track s) { <option [ngValue]="s">{{ s }}</option> }
            </select>
            <button type="button" class="icon-btn border-gray-200 w-[34px] h-[34px]" [disabled]="page() <= 1" (click)="page.set(page() - 1)" aria-label="السابق">‹</button>
            @for (p of pageList(); track p) {
              <button type="button" class="icon-btn w-[34px] h-[34px]" (click)="page.set(p)"
                [class]="p === page() ? 'bg-navy text-white border-navy' : 'border-gray-200'">{{ p }}</button>
            }
            <button type="button" class="icon-btn border-gray-200 w-[34px] h-[34px]" [disabled]="page() >= pages()" (click)="page.set(page() + 1)" aria-label="التالي">›</button>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class LookupTabsPage {
  private readonly dialog = inject(ConfirmService);
  readonly group = input<'hr' | 'salary'>('hr');
  readonly title = input('الإعدادات');
  readonly tab = input<string>();

  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly store = inject(MockLookupStore);
  private readonly lookups = inject(LookupsService);

  protected readonly tabs = computed(() => (this.group() === 'hr' ? HR_TABS : SALARY_TABS));
  protected readonly current = computed<LookupTab>(() => this.tabs().find((t) => t.slug === this.tab()) ?? this.tabs()[0]);

  protected readonly rows = signal<Row[]>([]);
  protected readonly q = signal('');
  protected readonly page = signal(1);
  protected readonly size = signal(10);
  protected readonly editing = signal<Row | null>(null);
  protected readonly draft = signal<Row>({});
  protected readonly isNew = signal(false);

  protected readonly filtered = computed(() => {
    const q = this.q().trim();
    return q ? this.rows().filter((r) => Object.values(r).some((v) => String(v).includes(q))) : this.rows();
  });
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.size())));
  protected readonly pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));
  /** After a delete, never stay on a page that no longer exists. */
  private readonly clampPage = effect(() => { const max = this.pages(); if (this.page() > max) this.page.set(max); });
  protected readonly paged = computed(() => this.filtered().slice((this.page() - 1) * this.size(), this.page() * this.size()));

  constructor() {
    effect((onCleanup) => {
      const t = this.current();
      this.editing.set(null);
      this.q.set('');
      this.page.set(1);
      this.rows.set([]);
      const sub = this.api.get<Row[]>(`/settings/lookups/${t.slug}`, undefined, () => this.store.rows(t.slug)).subscribe((r) => this.rows.set(r));
      onCleanup(() => sub.unsubscribe()); // switching tabs quickly never shows another tab's rows
    });
  }

  protected select(slug: string) {
    this.router.navigate([], { queryParams: { tab: slug }, replaceUrl: true });
  }
  protected edit(r: Row) { this.isNew.set(false); this.draft.set({ ...r }); this.editing.set(r); }
  protected add() {
    const blank: Row = {};
    for (const c of this.current().cols) blank[c.key] = c.type === 'check' ? false : c.type === 'select' ? c.options?.[0] ?? '' : '';
    this.rows.update((rs) => [blank, ...rs]);
    this.page.set(1);
    this.isNew.set(true);
    this.draft.set({ ...blank });
    this.editing.set(blank);
  }
  protected cancel() {
    const e = this.editing();
    if (this.isNew()) this.rows.update((rs) => rs.filter((r) => r !== e));
    this.editing.set(null);
  }
  protected save() {
    const e = this.editing()!, d = this.draft();
    const keyCol = this.current().idKey ?? this.current().cols[0].key;
    if (!String(d[this.current().cols[0].key] ?? '').trim()) { this.toast.error(`برجاء إدخال ${this.current().cols[0].label}`); return; }
    const url = `/settings/lookups/${this.current().slug}`;
    const req = this.isNew() ? this.api.post(url, d, d) : this.api.put(`${url}/${e[keyCol]}`, d, d);
    req.subscribe(() => {
      this.rows.update((rs) => rs.map((r) => (r === e ? d : r)));
      this.synced();
      this.editing.set(null);
      this.toast.success('تم الحفظ بنجاح');
    });
  }
  protected async remove(r: Row) {
    if (!(await this.dialog.ask('هل تريد حذف هذا السجل؟'))) return;
    const keyCol = this.current().idKey ?? this.current().cols[0].key;
    this.api.delete(`/settings/lookups/${this.current().slug}/${r[keyCol]}`).subscribe(() => {
      this.rows.update((rs) => rs.filter((x) => x !== r));
      this.synced();
      this.toast.success('تم الحذف');
    });
  }
  /** Keeps every dropdown in the app in sync with the table that was just edited. */
  private synced() {
    this.store.set(this.current().slug, this.rows());
    this.lookups.refresh();
  }
}
