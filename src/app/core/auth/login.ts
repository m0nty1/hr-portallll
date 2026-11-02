import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-page p-4">
      <form (ngSubmit)="submit()" class="card w-full max-w-sm p-8 flex flex-col gap-4 shadow-sm">
        <div class="flex flex-col items-center gap-2 mb-2">
          <img src="assets/ueedc-logo.png" alt="" class="w-16 h-16 rounded-full bg-white object-contain" />
          <h1 class="text-2xl font-black text-navy">برنامج الاستحقاقات</h1>
          <p class="text-xs text-gray-400">شركة مصر العليا لتوزيع الكهرباء</p>
        </div>
        <label class="flex flex-col gap-1">
          <span class="field-label">اسم المستخدم</span>
          <input class="input" name="u" [(ngModel)]="username" required autocomplete="username" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="field-label">كلمة المرور</span>
          <input class="input" name="p" type="password" [(ngModel)]="password" required autocomplete="current-password" />
        </label>
        @if (error()) { <p class="text-sm text-red-500">{{ error() }}</p> }
        <button type="submit" class="btn-primary w-full" [disabled]="busy()">{{ busy() ? 'جاري الدخول...' : 'تسجيل الدخول' }}</button>
      </form>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected username = '';
  protected password = '';
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  submit() {
    if (!this.username || !this.password) { this.error.set('ادخل اسم المستخدم وكلمة المرور'); return; }
    this.busy.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => { this.busy.set(false); this.error.set('بيانات الدخول غير صحيحة'); },
    });
  }
}
