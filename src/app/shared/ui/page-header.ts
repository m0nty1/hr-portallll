import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LayoutService } from '../../core/layout/layout.service';
import { Icon } from './icon';

export interface Crumb { label: string; link?: string; }

@Component({
  selector: 'app-page-header',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-white border-b border-gray-100 px-4 md:px-[25px] py-[13px] flex items-center justify-between sticky top-0 z-10 no-print">
      <div class="text-right">
        <h1 class="text-base md:text-xl font-bold text-navy leading-tight">{{ title() }}</h1>
        <nav class="hidden sm:flex items-center gap-1 text-xs text-gray-400" aria-label="مسار الصفحة">
          @for (c of breadcrumb(); track $index; let last = $last) {
            @if ($index > 0) { <span>›</span> }
            @if (!last) {
              <a [routerLink]="c.link ?? null" class="text-brand font-medium cursor-pointer hover:underline">{{ c.label }}</a>
            } @else {
              <span>{{ c.label }}</span>
            }
          }
        </nav>
      </div>
      <div class="flex items-center gap-3 flex-row-reverse">
        <button type="button" (click)="layout.toggleMobile()" aria-label="القائمة"
          class="md:hidden w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100">
          <app-icon name="menu" [size]="20" />
        </button>
        <button type="button" class="w-[38px] h-[38px] rounded-full bg-gray-50 hidden sm:flex items-center justify-center text-gray-500 hover:bg-gray-100" aria-label="الرسائل">
          <app-icon name="mail" [size]="20" />
        </button>
        <button type="button" class="relative w-[38px] h-[38px] rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100" aria-label="الإشعارات">
          <app-icon name="bell" [size]="20" />
          <span class="absolute -top-1 -left-1 w-[17px] h-[17px] rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">5</span>
        </button>
        <div class="hidden sm:flex items-center gap-3 border-r border-gray-100 pr-3 mr-1">
          <div class="text-left leading-tight">
            <p class="text-sm font-bold text-gray-800">{{ auth.user().name }}</p>
            <p class="text-xs text-gray-400">{{ auth.user().role }}</p>
          </div>
          <img [src]="auth.user().avatar" alt="" class="w-[42px] h-[42px] rounded-full object-cover" />
        </div>
        @if (backTo()) {
          <button type="button" (click)="back()"
            class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white rounded-lg px-3 md:px-4 py-2">
            <app-icon name="chevron-right" />
            <span>رجوع</span>
          </button>
        }
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly breadcrumb = input<Crumb[]>([]);
  readonly hideBack = input(false);
  /** Parent route to go back to; falls back to browser history. */
  readonly backTo = input<string>();

  protected readonly layout = inject(LayoutService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  back() {
    const to = this.backTo();
    if (to) this.router.navigateByUrl(to);
    else if (history.length > 1) this.location.back();
    else this.router.navigateByUrl('/');
  }
}
