import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from './icon';

@Component({
  selector: 'app-pagination',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 no-print">
      @if (showSize()) {
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>عرض</span>
          <div class="relative">
            <select [ngModel]="pageSize()" (ngModelChange)="pageSize.set(+$event)"
              class="border border-gray-200 rounded-lg py-1 pr-2 pl-6 text-sm bg-white">
              @for (s of sizes(); track s) { <option [ngValue]="s">{{ s }}</option> }
            </select>
            <app-icon name="chevron-down" class="absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
          <span>لكل صفحة</span>
        </div>
      }
      <div class="flex items-center gap-2">
        <button type="button" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          [disabled]="page() >= pages()" (click)="page.set(page() + 1)">التالي</button>
        @for (p of visible(); track $index) {
          @if (p === 0) { <span class="text-gray-400">...</span> }
          @else {
            <button type="button" (click)="page.set(p)" class="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center"
              [class]="p === page() ? (navy() ? 'bg-navy text-white' : 'bg-brand text-white') : 'border border-gray-200 text-gray-500 hover:bg-gray-50'">{{ p }}</button>
          }
        }
        <button type="button" class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          [disabled]="page() <= 1" (click)="page.set(page() - 1)">السابق</button>
      </div>
      <p class="text-sm text-gray-500">{{ summary() }}</p>
    </div>
  `,
})
export class Pagination {
  readonly page = model(1);
  readonly pageSize = model(10);
  readonly total = input(0);
  readonly sizes = input([10, 20, 50]);
  readonly showSize = input(true);
  /** Navy active page (used on the salary items/groups pages). */
  readonly navy = input(false);
  readonly unit = input('');

  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly visible = computed(() => {
    const n = this.pages(), c = this.page();
    if (n <= 5) return Array.from({ length: n }, (_, i) => i + 1);
    const set = [1, c - 1, c, c + 1, n].filter((p) => p >= 1 && p <= n);
    const out: number[] = [];
    [...new Set(set)].sort((a, b) => a - b).forEach((p, i, a) => { if (i && p - a[i - 1] > 1) out.push(0); out.push(p); });
    return out;
  });
  protected readonly summary = computed(() => {
    const t = this.total();
    if (!t) return 'لا توجد نتائج';
    const from = (this.page() - 1) * this.pageSize() + 1;
    const to = Math.min(t, this.page() * this.pageSize());
    return `عرض ${from} - ${to} من ${t}${this.unit() ? ' ' + this.unit() : ''}`;
  });
}
