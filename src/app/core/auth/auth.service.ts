import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, tap } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface CurrentUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  /** Permission keys returned by the backend (e.g. "salaries.calculate"). Empty = all allowed in mock mode. */
  permissions: string[];
}
interface LoginResponse { token: string; user: CurrentUser; }

const TOKEN_KEY = 'hr.token';
const USER_KEY = 'hr.user';
const GUEST: CurrentUser = { id: '', name: '', role: '', avatar: 'assets/avatar.png', permissions: [] };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<CurrentUser>(this.read<CurrentUser>(USER_KEY) ?? GUEST);
  readonly user = this._user.asReadonly();
  readonly token = signal<string | null>(this.read<string>(TOKEN_KEY));
  readonly isLoggedIn = computed(() => !!this.token());

  login(username: string, password: string): Observable<LoginResponse> {
    const mock: LoginResponse = {
      token: 'mock-token',
      user: {
        id: '1', name: 'أحمد محمد', role: 'مدير النظام', permissions: [],
        avatar: 'assets/avatar.png',
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

  logout() {
    this.token.set(null);
    this._user.set(GUEST);
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {}
    this.router.navigateByUrl('/login');
  }

  can(permission: string) {
    const p = this._user().permissions;
    return p.length === 0 || p.includes(permission);
  }

  private read<T>(k: string): T | null {
    try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
  }
  private write(k: string, v: unknown) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  }
}

