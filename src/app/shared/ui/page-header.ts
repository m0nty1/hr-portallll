import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LayoutService } from '../../core/layout/layout.service';
import { Icon } from './icon';
import { NotificationsMenu, UserMenu } from './header-menus';

export interface Crumb { label: string; link?: string; }

@Component({
  selector: 'app-page-header',
  imports: [Icon, RouterLink, NotificationsMenu, UserMenu],
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
        <app-notifications-menu />
        <app-user-menu />
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
