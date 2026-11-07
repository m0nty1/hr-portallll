import { Injectable, inject } from '@angular/core';
import { ApiService, Query } from '../../core/api/api.service';

export interface SystemUser {
  id: number;
  name: string;
  username: string;
  group: string;
  /** Sector the user's data is limited to; 'جميع القطاعات' = no limit. */
  sector: string;
  active: boolean;
  /** ISO timestamp, or '' if the user never signed in. */
  lastLogin: string;
}
export type PermAction = 'view' | 'add' | 'edit' | 'delete' | 'print';
export const PERM_ACTIONS: { key: PermAction; label: string }[] = [
  { key: 'view', label: 'عرض' }, { key: 'add', label: 'إضافة' }, { key: 'edit', label: 'تعديل' }, { key: 'delete', label: 'حذف' }, { key: 'print', label: 'طباعة وتصدير' },
];
export const PERM_SECTIONS: { key: string; label: string; actions: PermAction[] }[] = [
  { key: 'hr', label: 'الموارد البشرية', actions: ['view', 'add', 'edit', 'delete', 'print'] },
  { key: 'salaries', label: 'المرتبات والحوافز', actions: ['view', 'add', 'edit', 'delete', 'print'] },
  { key: 'attendance', label: 'الحضور والانصراف', actions: ['view', 'add', 'edit', 'delete', 'print'] },
  { key: 'reports', label: 'التقارير', actions: ['view', 'print'] },
  { key: 'settings', label: 'الإعدادات', actions: ['view', 'add', 'edit', 'delete', 'print'] },
];
export type PermMatrix = Record<string, Partial<Record<PermAction, boolean>>>;
export interface UserGroup { id: number; name: string; color: string; users: number; permissions: PermMatrix; }
export interface UsersStats { total: number; active: number; suspended: number; groups: number; }
export interface ResetPasswordRequest { userId: number; newPassword: string; mustChange: boolean; endSessions: boolean; }
export const ALL_SECTORS = 'جميع القطاعات';

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const full = (): PermMatrix => Object.fromEntries(PERM_SECTIONS.map((s) => [s.key, Object.fromEntries(s.actions.map((a) => [a, true]))]));
const only = (m: Record<string, PermAction[]>): PermMatrix => Object.fromEntries(PERM_SECTIONS.map((s) => [s.key, Object.fromEntries(s.actions.map((a) => [a, (m[s.key] ?? []).includes(a)]))]));

/** Demo store used while environment.useMock = true. */
class MockStore {
  private seq = 100;
  users: SystemUser[] = [
    { id: 1, name: 'أحمد محمد', username: 'ahmed.mohamed', group: 'مدير النظام', sector: ALL_SECTORS, active: true, lastLogin: ago(1) },
    { id: 2, name: 'منى سعيد حسن', username: 'mona.saeed', group: 'مسؤول مرتبات', sector: 'المركز الرئيسي', active: true, lastLogin: ago(3) },
    { id: 3, name: 'خالد إبراهيم محمود', username: 'khaled.ibrahim', group: 'مراجع', sector: 'أسوان', active: true, lastLogin: ago(20) },
    { id: 4, name: 'سارة عبد الله يوسف', username: 'sara.abdallah', group: 'مسؤول موارد بشرية', sector: 'الأقصر', active: false, lastLogin: ago(24 * 17) },
    { id: 5, name: 'محمود حسن سالم', username: 'mahmoud.hassan', group: 'مسؤول حضور وانصراف', sector: 'قنا', active: true, lastLogin: ago(26) },
    { id: 6, name: 'هبة علي إبراهيم', username: 'heba.ali', group: 'مستعلم (عرض فقط)', sector: 'سوهاج', active: true, lastLogin: '' },
    { id: 7, name: 'ياسر عبد الحميد', username: 'yasser.abdelhamid', group: 'مسؤول مرتبات', sector: 'أسيوط', active: true, lastLogin: ago(50) },
    { id: 8, name: 'نهى محمود السيد', username: 'noha.mahmoud', group: 'مسؤول مرتبات', sector: 'سوهاج', active: true, lastLogin: ago(5) },
    { id: 9, name: 'عمرو سامي فؤاد', username: 'amr.samy', group: 'مستعلم (عرض فقط)', sector: 'قنا', active: false, lastLogin: ago(24 * 40) },
  ];
  groups: Omit<UserGroup, 'users'>[] = [
    { id: 1, name: 'مدير النظام', color: 'purple', permissions: full() },
    { id: 2, name: 'مسؤول مرتبات', color: 'blue', permissions: only({ hr: ['view', 'print'], salaries: ['view', 'add', 'edit', 'delete', 'print'], attendance: ['view', 'print'], reports: ['view', 'print'] }) },
    { id: 3, name: 'مسؤول موارد بشرية', color: 'green', permissions: only({ hr: ['view', 'add', 'edit', 'delete', 'print'], attendance: ['view', 'add', 'edit', 'print'], reports: ['view', 'print'] }) },
    { id: 4, name: 'مسؤول حضور وانصراف', color: 'orange', permissions: only({ hr: ['view'], attendance: ['view', 'add', 'edit', 'delete', 'print'], reports: ['view', 'print'] }) },
    { id: 5, name: 'مراجع', color: 'red', permissions: only({ hr: ['view', 'print'], salaries: ['view', 'print'], attendance: ['view', 'print'], reports: ['view', 'print'] }) },
    { id: 6, name: 'مستعلم (عرض فقط)', color: 'gray', permissions: only({ hr: ['view'], salaries: ['view'], attendance: ['view'], reports: ['view'] }) },
  ];
  withCounts(): UserGroup[] { return this.groups.map((g) => ({ ...structuredClone(g), users: this.users.filter((u) => u.group === g.name).length })); }
  next() { return ++this.seq; }
}

/**
 * GET /users?q=&group=&status= · POST /users · PUT /users/:id · DELETE /users/:id · PATCH /users/:id/status {active}
 * GET /users/stats · POST /users/:id/reset-password
 * GET /user-groups · POST /user-groups · PUT /user-groups/:id/permissions
 */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);
  private readonly m = new MockStore();

  list(q: Query = {}) {
    return this.api.get<SystemUser[]>('/users', q, () => {
      const t = String(q['q'] ?? '').trim();
      return structuredClone(this.m.users.filter((u) =>
        (!t || u.name.includes(t) || u.username.includes(t)) && (!q['group'] || u.group === q['group']) &&
        (!q['status'] || (q['status'] === 'active') === u.active)));
    });
  }
  stats() {
    return this.api.get<UsersStats>('/users/stats', undefined, () => ({
      total: this.m.users.length, active: this.m.users.filter((u) => u.active).length,
      suspended: this.m.users.filter((u) => !u.active).length, groups: this.m.groups.length,
    }));
  }
  save(u: SystemUser, isNew: boolean) {
    if (isNew) return this.api.post<SystemUser>('/users', { ...u, id: undefined }, () => { const r = { ...u, id: this.m.next(), lastLogin: '' }; this.m.users.unshift(r); return structuredClone(r); });
    return this.api.put<SystemUser>(`/users/${u.id}`, u, () => { this.m.users = this.m.users.map((x) => (x.id === u.id ? { ...u } : x)); return structuredClone(u); });
  }
  setActive(u: SystemUser, active: boolean) {
    return this.api.patch<SystemUser>(`/users/${u.id}/status`, { active }, () => { this.m.users = this.m.users.map((x) => (x.id === u.id ? { ...x, active } : x)); return { ...u, active }; });
  }
  remove(id: number) { return this.api.delete(`/users/${id}`, () => { this.m.users = this.m.users.filter((u) => u.id !== id); }); }
  /** The new password is sent once and never shown again; the server logs who reset it. */
  resetPassword(r: ResetPasswordRequest) { return this.api.post<void>(`/users/${r.userId}/reset-password`, r, () => undefined); }

  groups() { return this.api.get<UserGroup[]>('/user-groups', undefined, () => this.m.withCounts()); }
  addGroup(name: string) {
    return this.api.post<UserGroup>('/user-groups', { name }, () => {
      const g = { id: this.m.next(), name, color: 'gray', permissions: only({}) };
      this.m.groups.push(g);
      return { ...structuredClone(g), users: 0 };
    });
  }
  savePermissions(groupId: number, permissions: PermMatrix) {
    return this.api.put<UserGroup>(`/user-groups/${groupId}/permissions`, permissions, () => {
      this.m.groups = this.m.groups.map((g) => (g.id === groupId ? { ...g, permissions: structuredClone(permissions) } : g));
      return this.m.withCounts().find((g) => g.id === groupId)!;
    });
  }
}
