import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification, NotificationsService, timeAgo } from '../../shared/data/notifications.service';
import { KIND_STYLE } from '../../shared/ui/header-menus';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';

/** /notifications — full list with all / unread filter. */
@Component({
  selector: 'app-notifications-page',
  imports: [PageHeader, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="الإشعارات" [breadcrumb]="[{ label: 'الرئيسية', link: '/' }, { label: 'الإشعارات' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card">
        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
          <div class="flex gap-1 bg-gray-50 rounded-lg p-1" role="tablist">
            @for (f of filters; track f.key) {
              <button type="button" role="tab" [attr.aria-selected]="filter() === f.key" (click)="filter.set(f.key)"
                class="px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
                [class]="filter() === f.key ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'">
                {{ f.label }} @if (f.key === 'unread' && svc.unread()) { <span class="text-brand">({{ svc.unread() }})</span> }
              </button>
            }
          </div>
          <div class="flex gap-2">
            <button type="button" class="btn-outline" (click)="svc.load(true)"><app-icon name="refresh" [size]="16" /> تحديث</button>
            <button type="button" class="btn-primary" [disabled]="!svc.unread()" (click)="svc.markAllRead()"><app-icon name="check" [size]="16" /> تعليم الكل كمقروء</button>
          </div>
        </div>
        <ul class="divide-y divide-gray-50">
          @for (n of shown(); track n.id) {
            <li class="flex items-start gap-4 px-5 py-4" [class.bg-blue-50/40]="!n.read">
              <span class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center" [class]="kinds[n.kind].cls"><app-icon [name]="kinds[n.kind].icon" [size]="18" /></span>
              <button type="button" class="flex-1 min-w-0 text-right" (click)="open(n)">
                <span class="flex items-center gap-2">
                  @if (!n.read) { <span class="w-2 h-2 rounded-full bg-brand shrink-0" aria-label="غير مقروء"></span> }
                  <span class="text-sm text-gray-800" [class.font-bold]="!n.read" [class.font-medium]="n.read">{{ n.title }}</span>
                </span>
                <span class="block text-sm text-gray-500 mt-1">{{ n.body }}</span>
                <span class="block text-xs text-gray-400 mt-1.5">{{ ago(n.at) }}</span>
              </button>
              <div class="flex gap-2 shrink-0">
                @if (!n.read) {
                  <button type="button" class="icon-btn border-gray-200 text-gray-500 hover:text-navy" (click)="svc.markRead(n.id)" aria-label="تعليم كمقروء" title="تعليم كمقروء"><app-icon name="check" [size]="16" /></button>
                }
                <button type="button" class="icon-btn-delete" (click)="svc.remove(n.id)" aria-label="حذف الإشعار" title="حذف"><app-icon name="delete" [size]="16" /></button>
              </div>
            </li>
          } @empty {
            <li class="px-5 py-16 text-center text-sm text-gray-400">
              {{ svc.loading() ? 'جاري التحميل...' : filter() === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات' }}
            </li>
          }
        </ul>
      </section>
    </main>
  `,
})
export class NotificationsPage {
  protected readonly svc = inject(NotificationsService);
  private readonly router = inject(Router);
  protected readonly kinds = KIND_STYLE;
  protected readonly ago = timeAgo;
  protected readonly filters = [{ key: 'all', label: 'الكل' }, { key: 'unread', label: 'غير المقروءة' }] as const;
  protected readonly filter = signal<'all' | 'unread'>('all');
  protected readonly shown = computed(() => (this.filter() === 'unread' ? this.svc.items().filter((n) => !n.read) : this.svc.items()));
  constructor() { this.svc.load(); }
  open(n: AppNotification) { this.svc.markRead(n.id); if (n.link) this.router.navigateByUrl(n.link); }
}
