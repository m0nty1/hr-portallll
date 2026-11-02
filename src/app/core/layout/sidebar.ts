import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { Icon } from '../../shared/ui/icon';
import { AuthService } from '../auth/auth.service';
import { LayoutService } from './layout.service';
import { NAV, NavGroup } from './nav.config';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly layout = inject(LayoutService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly nav = NAV;

  protected readonly url = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url },
  );
  /** Labels are visible when hovered (desktop) or opened as a drawer (mobile). */
  protected readonly show = computed(() => this.layout.expanded() || this.layout.mobileOpen());
  protected readonly openGroups = signal(new Set<string>());

  constructor() {
    // Auto-open the group that contains the current page.
    effect(() => {
      const url = this.url();
      const active = NAV.filter((n): n is NavGroup => n.type === 'group' && this.isGroupActive(n, url)).map((g) => g.id);
      this.openGroups.update((s) => new Set([...s, ...active]));
    });
  }

  protected isGroupActive(g: NavGroup, url = this.url()) {
    return g.prefixes.some((p) => url.startsWith(p));
  }
  protected toggle(id: string) {
    if (!this.show()) return;
    this.openGroups.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
}
