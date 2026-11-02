import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LookupsService } from '../../shared/data/lookups.service';
import { Icon, IconName } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';

/** Screen 07 – التقارير (/reports). Category cards; hover = shadow + orange border. */
@Component({
  selector: 'app-reports',
  imports: [PageHeader, Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="التقارير" [breadcrumb]="[{ label: 'التقارير' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <div class="flex flex-wrap gap-2 justify-end">
        <label class="relative">
          <span class="sr-only">الإدارة</span>
          <app-icon name="grid" [size]="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select class="input !w-auto !pr-8 !py-2 text-xs" [value]="dept()" (change)="dept.set($any($event.target).value)">
            <option value="">جميع الإدارات</option>@for (d of lk()?.departments ?? []; track d) { <option>{{ d }}</option> }
          </select>
        </label>
        <label class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 text-xs text-gray-500">إلى تاريخ <input type="date" class="py-2" [value]="to()" (change)="to.set($any($event.target).value)" /></label>
        <label class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 text-xs text-gray-500">من تاريخ <input type="date" class="py-2" [value]="from()" (change)="from.set($any($event.target).value)" /></label>
        <a routerLink="/reports/custom" class="btn-primary"><app-icon name="plus" [size]="16" /> إنشاء تقرير</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[11px]">
        @for (c of cards; track c.to) {
          <a [routerLink]="c.to" [queryParams]="{ from: from(), to: to(), department: dept() || null }"
            class="card p-4 flex flex-col gap-2 hover:shadow-lg hover:border-brand transition-all group">
            <span class="w-11 h-11 rounded-xl flex items-center justify-center self-start" [class]="c.bg"><app-icon [name]="c.icon" [size]="20" /></span>
            <h2 class="font-bold text-navy">{{ c.title }}</h2>
            <p class="text-xs text-gray-400">{{ c.sub }}</p>
            <app-icon name="chevron-left" [size]="16" class="text-brand self-end group-hover:-translate-x-1 transition-transform" />
          </a>
        }
      </div>
    </main>
  `,
})
export class Reports {
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly from = signal('2024-06-01');
  protected readonly to = signal('2024-06-30');
  protected readonly dept = signal('');
  protected readonly cards: { title: string; sub: string; to: string; icon: IconName; bg: string }[] = [
    { title: 'تقارير المرتبات', sub: 'تقارير الأجور والاستقطاعات', to: '/reports/salaries', icon: 'card', bg: 'bg-purple-50 text-purple-500' },
    { title: 'تقارير الصرفيات', sub: 'كشوف الحوافز والصرفيات', to: '/reports/disbursements', icon: 'wallet', bg: 'bg-orange-50 text-brand' },
    { title: 'تقارير الموارد البشرية', sub: 'بيانات الموظفين والحركات', to: '/reports/hr', icon: 'users', bg: 'bg-blue-50 text-blue-500' },
    { title: 'تقارير الحضور والانصراف', sub: 'سجلات الحضور والانصراف', to: '/reports/attendance', icon: 'clock', bg: 'bg-teal-50 text-teal-500' },
    { title: 'تقارير إدارية', sub: 'تقارير الإدارات والقطاعات', to: '/reports/admin', icon: 'chart', bg: 'bg-indigo-50 text-indigo-500' },
    { title: 'تقارير ضريبية', sub: 'تقارير الضرائب والاستقطاعات الضريبية', to: '/reports/tax', icon: 'percent', bg: 'bg-red-50 text-red-500' },
    { title: 'تقارير المعاشات', sub: 'تقارير التأمين والمعاشات', to: '/reports/pension', icon: 'shield', bg: 'bg-cyan-50 text-cyan-500' },
    { title: 'تقارير مخصصة', sub: 'إنشاء تقارير مخصصة', to: '/reports/custom', icon: 'settings', bg: 'bg-yellow-50 text-yellow-600' },
  ];
}
