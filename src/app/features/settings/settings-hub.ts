import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { exportCsv } from '../../shared/util/export';
import { CARD_TINTS, SETTING_CATEGORIES, SETTINGS } from './settings-catalog';

/** Screen 23 – إعدادات النظام (/settings/system). Category side list (208px) + 5-column card grid. */
@Component({
  selector: 'app-settings-hub',
  imports: [PageHeader, Icon, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="إعدادات النظام" [breadcrumb]="[{ label: 'الإعدادات' }]" />
    <div class="flex flex-col md:flex-row flex-1">
      <aside class="md:w-[208px] bg-white border-l border-gray-100 p-3 shrink-0">
        <p class="text-xs text-gray-400 mb-2 px-2">الفئات</p>
        <nav class="flex md:flex-col gap-1 overflow-x-auto">
          @for (c of cats; track c) {
            <button type="button" (click)="cat.set(c)" class="text-right text-sm px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
              [class]="cat() === c ? 'bg-navy text-white font-bold' : 'text-gray-600 hover:bg-gray-50'">{{ c }}</button>
          }
        </nav>
      </aside>
      <main class="flex-1 p-[13px] flex flex-col gap-[11px] min-w-0">
        <div class="flex items-center justify-between gap-3">
          <label class="relative w-full max-w-[280px]">
            <app-icon name="search" [size]="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input class="input !pl-9" placeholder="ابحث في الإعدادات..." [ngModel]="q()" (ngModelChange)="q.set($event)" />
          </label>
          <button type="button" class="btn-primary" (click)="export()"><app-icon name="upload" [size]="16" /> حفظ / تصدير</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-[11px]">
          @for (s of view(); track s.n) {
            @let t = tint(s.n);
            <a [routerLink]="s.to" [queryParams]="s.query ?? null" class="rounded-[13px] border border-white p-4 flex flex-col gap-1.5 hover:shadow-md hover:border-brand transition-all" [class]="t.bg">
              <span class="w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center self-start" [class]="t.badge">{{ s.n }}</span>
              <h2 class="font-bold text-navy text-sm mt-1">{{ s.title }}</h2>
              <p class="text-xs text-gray-400">{{ s.desc }}</p>
            </a>
          } @empty { <p class="col-span-full text-center text-sm text-gray-400 py-10">لا توجد إعدادات مطابقة</p> }
        </div>
      </main>
    </div>
  `,
})
export class SettingsHub {
  protected readonly cats = ['جميع الإعدادات', ...SETTING_CATEGORIES];
  protected readonly cat = signal('جميع الإعدادات');
  protected readonly q = signal('');
  protected readonly view = computed(() => SETTINGS.filter((s) => (this.cat() === 'جميع الإعدادات' || s.cat === this.cat()) && (s.title + s.desc).includes(this.q().trim())));
  protected tint(n: number) { return CARD_TINTS[(n - 1) % CARD_TINTS.length]; }
  export() { exportCsv('إعدادات-النظام', ['#', 'الإعداد', 'الوصف', 'الفئة'], SETTINGS.map((s) => [s.n, s.title, s.desc, s.cat])); }
}
