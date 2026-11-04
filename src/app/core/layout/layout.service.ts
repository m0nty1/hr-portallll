import { Injectable, signal } from '@angular/core';

/** UI state shared between the shell, the sidebar and every page header. */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** Desktop: sidebar expands from 64px to 224px on hover. */
  readonly expanded = signal(false);
  /** Mobile: sidebar is an off-canvas drawer. */
  readonly mobileOpen = signal(false);

  toggleMobile() { this.mobileOpen.update((v) => !v); }
  closeMobile() { this.mobileOpen.set(false); this.expanded.set(false); }
}
