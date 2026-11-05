import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ALL_PERMISSIONS } from './permission-keys';

export interface CurrentUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  /** Permission keys returned by the backend (e.g. "salaries.calculate"). Empty = no access. */
  permissions: string[];
  username?: string;
  email?: string;
  phone?: string;
  department?: string;
  lastLogin?: string;
}
export interface ProfileUpdate { name: string; email: string; phone: string; }
interface LoginResponse { token: string; user: CurrentUser; }

const TOKEN_KEY = 'hr.token.v2';
const USER_KEY = 'hr.user.v2';
const GUEST: CurrentUser = { id: '', name: '', role: '', avatar: 'assets/avatar.png', permissions: [] };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<CurrentUser>(this.read<CurrentUser>(USER_KEY) ?? GUEST);
  readonly user = this._user.asReadonly();
  readonly token = signal<string | null>(this.read<string>(TOKEN_KEY));
  readonly isLoggedIn = computed(() => !!this.token());
  /** True only when the backend granted the permission. No permissions = no access. */
  can(permission: string): boolean {
    return (this.user().permissions ?? []).includes(permission);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    // Demo/mock only: any non-empty credentials sign in as an explicit demo admin.
    // With useMock=false the backend decides (ApiService never returns this object).
    const mock: LoginResponse = {
      token: 'demo-token',
      user: {
        id: 'demo', name: 'أحمد محمد', role: 'مدير النظام (ديمو)', permissions: [...ALL_PERMISSIONS], avatar: 'assets/avatar.png',
        username, email: 'ahmed.mohamed@upper-egypt-elec.com.eg', phone: '01001234567', department: 'إدارة تقنية المعلومات',
        lastLogin: new Date().toISOString(),
      },
    };
    return this.api.post<LoginResponse>('/auth/login', { username, password }, mock).pipe(
      delay(0),
      tap((res) => {
        this.token.set(res.token);
        this._user.set(res.user);
        this.write(TOKEN_KEY, res.token);
        this.write(USER_KEY, res.user);
      }),
    );
  }

  /** PUT /auth/me — the user edits their own name, email and phone. */
  updateProfile(p: ProfileUpdate) {
    return this.api.put<CurrentUser>('/auth/me', p, () => ({ ...this.user(), ...p })).pipe(
      tap((u) => { this._user.set(u); this.write(USER_KEY, u); }),
    );
  }
  /** POST /auth/change-password { currentPassword, newPassword } */
  changePassword(currentPassword: string, newPassword: string) {
    return this.api.post<void>('/auth/change-password', { currentPassword, newPassword }, () => undefined);
  }

  logout() {
    // POST /auth/logout lets the server revoke the token; the local session is cleared either way.
    if (this.token()) this.api.post('/auth/logout', {}, () => null).subscribe({ error: () => {} });
    this.token.set(null);
    this._user.set(GUEST);
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {}
    this.router.navigateByUrl('/login');
  }

  private read<T>(k: string): T | null {
    try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
  }
  private write(k: string, v: unknown) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  }
}

