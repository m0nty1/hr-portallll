import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemUser, UserGroup, UsersService } from '../../shared/data/users.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';
import { GROUP_COLORS } from './system-users';

const RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: '8 أحرف على الأقل', test: (p) => p.length >= 8 },
  { label: 'حرف إنجليزي كبير (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'حرف إنجليزي صغير (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'رقم واحد على الأقل', test: (p) => /\d/.test(p) },
  { label: 'رمز خاص واحد على الأقل (مثل ! @ #)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/** إعادة تعيين كلمة المرور (/settings/reset-password?user=<id>). */
@Component({
  selector: 'app-reset-password',
  imports: [PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="إعادة تعيين كلمة المرور" [breadcrumb]="[{ label: 'الإعدادات' }, { label: 'مستخدمو النظام', link: '/settings/users' }, { label: 'إعادة تعيين كلمة المرور' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      @if (done(); as name) {
        <div class="card !border-green-200 bg-green-50 text-green-700 px-5 py-3 text-sm font-semibold flex items-center gap-2" role="status">
          <app-icon name="check" [size]="16" /> تم إعادة تعيين كلمة المرور لـ {{ name }} بنجاح@if (lastMustChange()) {، وسيُطلب منه تغييرها عند أول دخول}.
        </div>
      }
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-[11px] items-start">
        <form class="card p-5 lg:col-span-2 flex flex-col gap-4" (ngSubmit)="submit()">
          <label class="flex flex-col gap-1.5 text-sm text-gray-600 font-medium">المستخدم
            <select id="rp-user" name="user" class="input" [ngModel]="userId()" (ngModelChange)="selectUser($event)">
              <option [ngValue]="null">اختر المستخدم...</option>
              @for (u of users(); track u.id) { <option [ngValue]="u.id">{{ u.name }} — {{ u.username }}</option> }
            </select>
          </label>

          @if (user(); as u) {
            <div class="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <div class="flex items-center gap-3">
                <span class="w-11 h-11 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center">{{ initials(u.name) }}</span>
                <div><p class="font-bold text-navy">{{ u.name }}</p><p class="text-xs text-gray-500" dir="ltr" style="text-align:right">{{ u.username }}</p></div>
              </div>
              <div><p class="text-xs text-gray-400">مجموعة المستخدمين</p><span class="pill font-semibold mt-1 inline-block" [class]="groupClass(u.group)">{{ u.group }}</span></div>
              <div><p class="text-xs text-gray-400">القطاع</p><p class="font-bold text-gray-800 mt-1">{{ u.sector }}</p></div>
              <div><p class="text-xs text-gray-400">الحالة</p>
                <span class="pill font-semibold mt-1 inline-block" [class]="u.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ u.active ? 'فعال' : 'موقوف' }}</span>
              </div>
            </div>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5 text-sm text-gray-600 font-medium">كلمة المرور الجديدة
              <span class="relative">
                <input id="rp-new" name="pw" class="input !pl-10" dir="ltr" autocomplete="new-password" [type]="show() ? 'text' : 'password'" [ngModel]="pw()" (ngModelChange)="pw.set($event)" />
                <button type="button" class="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-navy" (click)="show.set(!show())" [attr.aria-label]="show() ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"><app-icon [name]="show() ? 'eye-off' : 'eye'" [size]="17" /></button>
              </span>
            </label>
            <label class="flex flex-col gap-1.5 text-sm text-gray-600 font-medium">تأكيد كلمة المرور
              <input id="rp-confirm" name="confirm" class="input" dir="ltr" autocomplete="new-password" [type]="show() ? 'text' : 'password'" [ngModel]="confirm()" (ngModelChange)="confirm.set($event)" />
              @if (confirm() && confirm() !== pw()) { <span class="text-xs text-red-600">غير مطابقة لكلمة المرور الجديدة</span> }
            </label>
          </div>

          <div class="flex items-center gap-3">
            <div class="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
              <div class="h-full rounded-full transition-all" [style.width.%]="strength().pct" [class]="strength().bar"></div>
            </div>
            <span class="text-xs font-semibold min-w-36" [class]="strength().text">{{ strength().label }}</span>
          </div>

          <div><button type="button" class="btn-outline" (click)="generate()"><app-icon name="sparkles" [size]="16" /> إنشاء كلمة مرور عشوائية</button></div>

          <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input id="rp-must" name="must" type="checkbox" class="checkbox" [(ngModel)]="mustChange" /> إلزام المستخدم بتغيير كلمة المرور عند أول دخول</label>
          <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input id="rp-end" name="end" type="checkbox" class="checkbox" [(ngModel)]="endSessions" /> إنهاء جلسات المستخدم الحالية</label>

          <div class="flex gap-2 border-t border-gray-100 pt-4">
            <button type="submit" class="btn-primary" [disabled]="saving()"><app-icon name="key" [size]="16" /> {{ saving() ? 'جاري الحفظ...' : 'إعادة تعيين كلمة المرور' }}</button>
            <button type="button" class="btn-outline" (click)="cancel()">إلغاء</button>
          </div>
        </form>

        <aside class="card p-5 flex flex-col gap-3">
          <h2 class="font-bold text-navy">متطلبات كلمة المرور</h2>
          <ul class="flex flex-col gap-2.5 text-sm">
            @for (r of checks(); track r.label) {
              <li class="flex items-center gap-2" [class]="r.ok ? 'text-green-600' : 'text-gray-600'">
                <span class="w-5 h-5 rounded-full border flex items-center justify-center shrink-0" [class]="r.ok ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'">
                  @if (r.ok) { <app-icon name="check" [size]="12" /> }
                </span>{{ r.label }}
              </li>
            }
          </ul>
          <p class="flex gap-2 rounded-lg bg-orange-50 text-orange-800 text-xs p-3 leading-relaxed"><app-icon name="lock" [size]="14" class="shrink-0 mt-0.5" /> لا تُعرض كلمة المرور بعد الحفظ، ويُسجَّل الإجراء في سجل النظام باسمك.</p>
        </aside>
      </div>
    </main>
  `,
})
export class ResetPassword {
  /** ?user=<id> preselects a user (from the key button in مستخدمو النظام). */
  readonly user$ = input<string | undefined>(undefined, { alias: 'user' });
  private readonly svc = inject(UsersService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly users = signal<SystemUser[]>([]);
  private readonly groups = signal<UserGroup[]>([]);
  protected readonly userId = signal<number | null>(null);
  protected readonly user = computed(() => this.users().find((u) => u.id === this.userId()) ?? null);
  protected readonly pw = signal('');
  protected readonly confirm = signal('');
  protected readonly show = signal(false);
  protected mustChange = true;
  protected endSessions = true;
  protected readonly saving = signal(false);
  protected readonly done = signal<string | null>(null);
  protected readonly lastMustChange = signal(true);
  protected readonly checks = computed(() => RULES.map((r) => ({ label: r.label, ok: r.test(this.pw()) })));
  protected readonly strength = computed(() => {
    const p = this.pw();
    if (!p) return { pct: 0, label: 'أدخل كلمة مرور لتقييم قوتها', bar: '', text: 'text-gray-400' };
    const n = this.checks().filter((c) => c.ok).length + (p.length >= 12 ? 1 : 0);
    if (n <= 2) return { pct: 25, label: 'ضعيفة', bar: 'bg-red-500', text: 'text-red-600' };
    if (n <= 4) return { pct: 60, label: 'متوسطة', bar: 'bg-orange-400', text: 'text-orange-600' };
    return { pct: 100, label: 'قوية', bar: 'bg-green-500', text: 'text-green-600' };
  });
  protected readonly initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join(' ');

  constructor() {
    this.svc.list().subscribe((u) => this.users.set(u));
    this.svc.groups().subscribe((g) => this.groups.set(g));
    effect(() => { const id = this.user$(); if (id) this.userId.set(+id); });
  }
  groupClass(name: string) { return GROUP_COLORS[this.groups().find((g) => g.name === name)?.color ?? 'gray'] ?? GROUP_COLORS['gray']; }
  selectUser(id: number | null) {
    this.userId.set(id); this.done.set(null);
    this.router.navigate([], { queryParams: { user: id }, replaceUrl: true });
  }
  generate() {
    const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@#$%&*?'];
    const rnd = (n: number) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
    const chars = sets.flatMap((s) => [s[rnd(s.length)], s[rnd(s.length)]]);
    const all = sets.join('');
    while (chars.length < 12) chars.push(all[rnd(all.length)]);
    for (let i = chars.length - 1; i > 0; i--) { const j = rnd(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
    const p = chars.join('');
    this.pw.set(p); this.confirm.set(p); this.show.set(true);
  }
  submit() {
    const u = this.user();
    if (!u) { this.toast.error('برجاء اختيار المستخدم'); return; }
    if (this.checks().some((c) => !c.ok)) { this.toast.error('كلمة المرور لا تحقق كل المتطلبات'); return; }
    if (this.pw() !== this.confirm()) { this.toast.error('تأكيد كلمة المرور غير مطابق'); return; }
    this.saving.set(true);
    this.svc.resetPassword({ userId: u.id, newPassword: this.pw(), mustChange: this.mustChange, endSessions: this.endSessions }).subscribe({
      next: () => {
        this.saving.set(false); this.lastMustChange.set(this.mustChange); this.done.set(u.name);
        this.pw.set(''); this.confirm.set(''); this.show.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => this.saving.set(false),
    });
  }
  cancel() { this.router.navigateByUrl('/settings/users'); }
}
