import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppNotification, NotificationKind, NotificationsService, timeAgo } from '../data/notifications.service';
import { Icon, IconName } from './icon';

export const KIND_STYLE: Record<NotificationKind, { icon: IconName; cls: string }> = {
  payroll: { icon: 'wallet', cls: 'bg-blue-50 text-blue-600' },
  leave: { icon: 'calendar', cls: 'bg-orange-50 text-orange-600' },
  penalty: { icon: 'alert', cls: 'bg-red-50 text-red-600' },
  employee: { icon: 'user', cls: 'bg-indigo-50 text-indigo-600' },
  report: { icon: 'file-text', cls: 'bg-green-50 text-green-600' },
  system: { icon: 'settings', cls: 'bg-gray-100 text-gray-600' },
};

/** Closes a dropdown on outside click or Escape. */
abstract class Dropdown {
  protected readonly host = inject(ElementRef<HTMLElement>);
  readonly open = signal(false);
  toggle() { this.open.update((v) => !v); }
  close() { this.open.set(false); }
  protected onDocClick(e: Event) { if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.close(); }
}

/** Bell button + dropdown with the latest notifications. */
@Component({
  selector: 'app-notifications-menu',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative', '(document:click)': 'onDocClick($event)', '(document:keydown.escape)': 'close()' },
  template: `
    <button type="button" (click)="toggle()" [attr.aria-expanded]="open()" aria-haspopup="true"
      class="relative w-[38px] h-[38px] rounded-full flex items-center justify-center hover:bg-gray-100"
      [class]="open() ? 'bg-gray-100 text-navy' : 'bg-gray-50 text-gray-500'"
      [attr.aria-label]="svc.unread() ? 'الإشعارات، ' + svc.unread() + ' غير مقروءة' : 'الإشعارات'">
      <app-icon name="bell" [size]="20" />
      @if (svc.unread()) {
        <span class="absolute -top-1 -left-1 min-w-[17px] h-[17px] px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">{{ svc.unread() > 9 ? '9+' : svc.unread() }}</span>
      }
    </button>
    @if (open()) {
      <div class="fixed sm:absolute inset-x-3 sm:inset-x-auto top-[68px] sm:top-[calc(100%+10px)] sm:left-0 sm:w-[380px] z-50 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden text-right" role="dialog" aria-label="الإشعارات">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p class="font-bold text-navy">الإشعارات @if (svc.unread()) { <span class="text-xs text-brand font-semibold">({{ svc.unread() }} جديدة)</span> }</p>
          <button type="button" class="text-xs font-semibold text-brand hover:underline disabled:text-gray-300 disabled:no-underline" [disabled]="!svc.unread()" (click)="svc.markAllRead()">تعليم الكل كمقروء</button>
        </div>
        <ul class="max-h-[60vh] sm:max-h-[420px] overflow-y-auto divide-y divide-gray-50">
          @for (n of svc.items().slice(0, 6); track n.id) {
            <li>
              <button type="button" (click)="openItem(n)" class="w-full flex items-start gap-3 px-4 py-3 text-right hover:bg-gray-50" [class.bg-blue-50/40]="!n.read">
                <span class="w-9 h-9 rounded-full shrink-0 flex items-center justify-center" [class]="kinds[n.kind].cls"><app-icon [name]="kinds[n.kind].icon" [size]="17" /></span>
                <span class="flex-1 min-w-0">
                  <span class="block text-sm text-gray-800" [class.font-bold]="!n.read" [class.font-medium]="n.read">{{ n.title }}</span>
                  <span class="block text-xs text-gray-500 mt-0.5 leading-relaxed">{{ n.body }}</span>
                  <span class="block text-[11px] text-gray-400 mt-1">{{ ago(n.at) }}</span>
                </span>
                @if (!n.read) { <span class="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" aria-label="غير مقروء"></span> }
              </button>
            </li>
          } @empty {
            <li class="px-4 py-10 text-center text-sm text-gray-400">{{ svc.loading() ? 'جاري التحميل...' : 'لا توجد إشعارات' }}</li>
          }
        </ul>
        <a routerLink="/notifications" (click)="close()" class="block text-center text-sm font-semibold text-navy py-3 border-t border-gray-100 hover:bg-gray-50">عرض كل الإشعارات</a>
      </div>
    }
  `,
})
export class NotificationsMenu extends Dropdown {
  protected readonly svc = inject(NotificationsService);
  private readonly router = inject(Router);
  protected readonly kinds = KIND_STYLE;
  protected readonly ago = timeAgo;
  constructor() { super(); this.svc.load(); }
  openItem(n: AppNotification) {
    this.svc.markRead(n.id);
    this.close();
    if (n.link) this.router.navigateByUrl(n.link);
  }
}
