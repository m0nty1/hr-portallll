import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { PERMISSION_LABELS } from '../../core/auth/permission-keys';
import { ConfirmService } from '../../shared/ui/confirm';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

/** /account — the signed-in user's profile, password and logout. */
@Component({
  selector: 'app-account-page',
  imports: [PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="الملف الشخصي" [breadcrumb]="[{ label: 'الرئيسية', link: '/' }, { label: 'الملف الشخصي' }]" />
    <main class="p-[13px] grid grid-cols-1 lg:grid-cols-3 gap-[11px] items-start">
      @let u = auth.user();
      <section class="card p-6 flex flex-col items-center text-center gap-2">
        <img [src]="u.avatar" alt="" class="w-24 h-24 rounded-full object-cover" />
        <h2 class="text-xl font-black text-navy mt-2">{{ u.name }}</h2>
        <p class="text-sm text-gray-500">{{ u.role }}</p>
        @if (u.department) { <p class="text-xs text-gray-400">{{ u.department }}</p> }
        <div class="w-full border-t border-gray-100 mt-4 pt-4 text-right text-sm flex flex-col gap-2">
          <p class="flex justify-between gap-3"><span class="text-gray-400">اسم المستخدم</span><b class="text-navy">{{ u.username || '—' }}</b></p>
          <p class="flex justify-between gap-3"><span class="text-gray-400">آخر دخول</span><b class="text-navy">{{ lastLogin(u.lastLogin) }}</b></p>
        </div>
        <button type="button" class="btn-outline w-full mt-4 !border-red-200 !text-red-600 hover:!bg-red-50" (click)="logout()"><app-icon name="logout" [size]="16" /> تسجيل الخروج</button>
      </section>

      <div class="lg:col-span-2 flex flex-col gap-[11px]">
        <section class="card p-5">
          <div class="flex items-center gap-2 mb-4 text-brand"><app-icon name="user" [size]="20" /><h2 class="font-bold text-navy text-base">البيانات الشخصية</h2></div>
          <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" (ngSubmit)="saveProfile()">
            <label class="flex flex-col gap-1 text-xs text-gray-500 font-medium">الاسم
              <input id="acc-name" name="name" class="input" [(ngModel)]="form.name" required /></label>
            <label class="flex flex-col gap-1 text-xs text-gray-500 font-medium">البريد الإلكتروني
              <input id="acc-email" name="email" type="email" class="input" dir="ltr" [(ngModel)]="form.email" /></label>
            <label class="flex flex-col gap-1 text-xs text-gray-500 font-medium">رقم الموبايل
              <input id="acc-phone" name="phone" class="input" dir="ltr" inputmode="tel" [(ngModel)]="form.phone" /></label>
            <label class="flex flex-col gap-1 text-xs text-gray-500 font-medium">الوظيفة
              <input class="input !bg-gray-100" [value]="u.role" readonly /></label>
            <div class="sm:col-span-2 flex gap-2">
              <button type="submit" class="btn-primary" [disabled]="savingProfile()">{{ savingProfile() ? 'جاري الحفظ...' : 'حفظ البيانات' }}</button>
              <button type="button" class="btn-outline" (click)="resetForm()">إلغاء</button>
            </div>
          </form>
        </section>

        <section class="card p-5" id="password">
          <div class="flex items-center gap-2 mb-4 text-brand"><app-icon name="lock" [size]="20" /><h2 class="font-bold text-navy text-base">تغيير كلمة المرور</h2></div>
          <form class="grid grid-cols-1 sm:grid-cols-3 gap-4" (ngSubmit)="changePassword()">
            <label class="flex flex-col gap-1 text-xs text-gray-500 font-medium">كلمة المرور الحالية
              <input id="pw-current" name="current" type="password" class="input" autocomplete="current-password" [(ngModel)]="pw.current" /></label>
            <label class="flex flex-col gap-1 text-xs text-gray-500 font-medium">كلمة المرور الجديدة
              <input id="pw-new" name="next" type="password" class="input" autocomplete="new-password" [(ngModel)]="pw.next" /></label>
            <label class="flex flex-col gap-1 text-xs text-gray-500 font-medium">تأكيد كلمة المرور
              <input id="pw-confirm" name="confirm" type="password" class="input" autocomplete="new-password" [(ngModel)]="pw.confirm" /></label>
            <p class="sm:col-span-3 text-xs text-gray-400">8 حروف على الأقل، وفيها حرف ورقم.</p>
            <div class="sm:col-span-3"><button type="submit" class="btn-primary" [disabled]="savingPw()">{{ savingPw() ? 'جاري التغيير...' : 'تغيير كلمة المرور' }}</button></div>
          </form>
        </section>

        <section class="card p-5">
          <div class="flex items-center gap-2 mb-4 text-brand"><app-icon name="shield" [size]="20" /><h2 class="font-bold text-navy text-base">الصلاحيات</h2></div>
          <div class="flex flex-wrap gap-2">
            @for (p of u.permissions; track p) { <span class="pill bg-blue-50 text-blue-700 font-semibold">{{ labels[p] || p }}</span> }
            @empty { <p class="text-sm text-gray-400">لا توجد صلاحيات</p> }
          </div>
        </section>
      </div>
    </main>
  `,
})
export class AccountPage {
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(ConfirmService);
  protected readonly labels: Record<string, string> = PERMISSION_LABELS;
  protected form = this.fromUser();
  protected pw = { current: '', next: '', confirm: '' };
  protected readonly savingProfile = signal(false);
  protected readonly savingPw = signal(false);

  constructor() {
    // "تغيير كلمة المرور" in the user menu opens this page at the password card.
    inject(ActivatedRoute).fragment.pipe(takeUntilDestroyed()).subscribe((f) => {
      if (f) setTimeout(() => { document.getElementById(f)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.getElementById('pw-current')?.focus({ preventScroll: true }); });
    });
  }

  private fromUser() { const u = this.auth.user(); return { name: u.name, email: u.email ?? '', phone: u.phone ?? '' }; }
  resetForm() { this.form = this.fromUser(); }
  lastLogin(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  saveProfile() {
    const f = { name: this.form.name.trim(), email: this.form.email.trim(), phone: this.form.phone.trim() };
    if (!f.name) { this.toast.error('برجاء إدخال الاسم'); return; }
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { this.toast.error('البريد الإلكتروني غير صحيح'); return; }
    if (f.phone && !/^01[0125]\d{8}$/.test(f.phone)) { this.toast.error('رقم الموبايل لازم يكون 11 رقم ويبدأ بـ 01'); return; }
    this.savingProfile.set(true);
    this.auth.updateProfile(f).subscribe({
      next: () => { this.savingProfile.set(false); this.form = this.fromUser(); this.toast.success('تم حفظ البيانات'); },
      error: () => this.savingProfile.set(false),
    });
  }

  changePassword() {
    const { current, next, confirm } = this.pw;
    if (!current || !next || !confirm) { this.toast.error('برجاء ملء كل خانات كلمة المرور'); return; }
    if (next.length < 8 || !/[0-9]/.test(next) || !/[^0-9]/.test(next)) { this.toast.error('كلمة المرور الجديدة لازم تكون 8 حروف على الأقل وفيها حرف ورقم'); return; }
    if (next !== confirm) { this.toast.error('تأكيد كلمة المرور غير مطابق'); return; }
    if (next === current) { this.toast.error('كلمة المرور الجديدة لازم تختلف عن الحالية'); return; }
    this.savingPw.set(true);
    this.auth.changePassword(current, next).subscribe({
      next: () => { this.savingPw.set(false); this.pw = { current: '', next: '', confirm: '' }; this.toast.success('تم تغيير كلمة المرور'); },
      error: () => this.savingPw.set(false),
    });
  }

  async logout() {
    if (await this.dialog.ask({ title: 'تسجيل الخروج', message: 'هل تريد تسجيل الخروج من البرنامج؟', confirmText: 'تسجيل الخروج', danger: true })) this.auth.logout();
  }
}
