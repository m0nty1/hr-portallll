import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Permission keys the backend returns in `user.permissions` (login response).
 * An empty list means "all allowed" — used by the mock admin and until the backend sends real permissions.
 */
export const PERMISSIONS = {
  hrView: 'hr.view',                 // الموظفين، الغياب، الجزاءات، الترقيات (عرض)
  hrEdit: 'hr.edit',                 // تعديل بيانات الموظفين والجزاءات والترقيات
  salariesView: 'salaries.view',     // شاشات المرتبات والحوافز (عرض)
  salariesEdit: 'salaries.edit',     // بنود، تخصيص، كشوف، أقساط
  salariesCalculate: 'salaries.calculate',
  salariesApprove: 'salaries.approve', // اعتماد الصرف + منح العلاوة الدورية
  reportsView: 'reports.view',
  settingsManage: 'settings.manage',
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Which permission each URL area needs (longest prefix wins). */
const ROUTE_PERMISSIONS: [string, Permission][] = [
  ['/employees', 'hr.view'], ['/attendance', 'hr.view'], ['/hr', 'hr.view'],
  ['/salaries/calculate', 'salaries.calculate'], ['/salaries/fiscal', 'salaries.approve'],
  ['/salaries', 'salaries.view'], ['/reports', 'reports.view'], ['/settings', 'settings.manage'],
];
export function permissionForUrl(url: string): Permission | null {
  const path = url.split(/[?#]/)[0];
  const hit = ROUTE_PERMISSIONS.filter(([p]) => path === p || path.startsWith(p + '/')).sort((a, b) => b[0].length - a[0].length)[0];
  return hit?.[1] ?? null;
}

/** Blocks navigation to areas the user has no permission for. */
export const permissionGuard: CanActivateChildFn = (_route, state) => {
  const need = permissionForUrl(state.url);
  return !need || inject(AuthService).can(need) ? true : inject(Router).createUrlTree(['/forbidden']);
};

/** Structural directive: `<button *appCan="'salaries.approve'">…</button>` */
@Directive({ selector: '[appCan]' })
export class CanDirective {
  readonly appCan = input.required<Permission>();
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);
  constructor() {
    effect(() => {
      this.vcr.clear();
      if (this.auth.can(this.appCan())) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}
