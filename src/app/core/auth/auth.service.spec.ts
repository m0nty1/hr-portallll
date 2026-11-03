import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService permissions', () => {
  beforeEach(() => { try { localStorage.clear(); } catch {} TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] }); });

  it('a user without permissions has no access', () => {
    const auth = TestBed.inject(AuthService);
    expect(auth.can('salaries.approve')).toBe(false);
  });

  it('the demo login gets an explicit full permission list', async () => {
    const auth = TestBed.inject(AuthService);
    await firstValueFrom(auth.login('demo', 'demo'));
    expect(auth.user().permissions.length).toBe(8);
    expect(auth.can('settings.manage')).toBe(true);
  });
});
