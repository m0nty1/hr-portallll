import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from './layout.service';
import { Sidebar } from './sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen bg-page" dir="rtl">
      @if (layout.mobileOpen()) {
        <div class="fixed inset-0 z-30 bg-black/40 md:hidden" (click)="layout.closeMobile()"></div>
      }
      <app-sidebar />
      <div class="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 md:mr-[68px] print:!mr-0"
        [style.margin-right]="layout.expanded() ? '224px' : null">
        <router-outlet />
      </div>
    </div>
  `,
})
export class Shell { protected readonly layout = inject(LayoutService); }
