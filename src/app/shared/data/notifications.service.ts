import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

export type NotificationKind = 'payroll' | 'leave' | 'penalty' | 'employee' | 'report' | 'system';
export interface AppNotification {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
  /** ISO timestamp. */
  at: string;
  read: boolean;
  /** App route to open when the notification is clicked. */
  link?: string;
}

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

/** Demo data used while environment.useMock = true. */
function mockNotifications(): AppNotification[] {
  return [
    { id: 9, kind: 'payroll', title: 'حساب مرتبات شهر أكتوبر جاهز للاعتماد', body: 'تم حساب مرتبات 1,248 موظف بإجمالي صافي 4,382,150.00 ج.م', at: ago(6), read: false, link: '/salaries/calculate' },
    { id: 8, kind: 'leave', title: 'طلب إجازة جديد', body: 'محمد علي حسن — إجازة عارضة يومين من 20/05/2026', at: ago(38), read: false, link: '/attendance/absence' },
    { id: 7, kind: 'penalty', title: 'تم تسجيل جزاء', body: 'خصم يوم على عمر عبدالرحمن فارس بقرار رقم 145/2026', at: ago(95), read: false, link: '/attendance/penalties' },
    { id: 6, kind: 'leave', title: 'رصيد إجازات منتهي', body: 'عمر عبدالرحمن فارس استنفد رصيد الإجازات الاعتيادية لسنة 2026', at: ago(180), read: false, link: '/attendance/absence' },
    { id: 5, kind: 'employee', title: 'تحديث بيانات موظف', body: 'تم تعديل بيان الأسرة للموظف علاء الدين قطب عبده حامد', at: ago(300), read: false, link: '/employees/00067' },
    { id: 4, kind: 'report', title: 'تقرير المرتبات الشهري جاهز', body: 'تقرير إجمالي المرتبات لشهر سبتمبر متاح للطباعة', at: ago(60 * 26), read: true, link: '/reports' },
    { id: 3, kind: 'payroll', title: 'تم اعتماد مرتبات شهر سبتمبر', body: 'اعتمد مدير الشئون المالية صرف مرتبات سبتمبر 2026', at: ago(60 * 24 * 3), read: true, link: '/salaries/calculate' },
    { id: 2, kind: 'system', title: 'إضافة بنك جديد', body: 'تمت إضافة "بنك القاهرة" إلى جدول البنوك في إعدادات الموارد البشرية', at: ago(60 * 24 * 5), read: true, link: '/settings' },
    { id: 1, kind: 'system', title: 'مرحباً بك في برنامج الاستحقاقات', body: 'يمكنك متابعة كل التنبيهات المهمة من هنا', at: ago(60 * 24 * 12), read: true },
  ];
}

/** "منذ 5 دقائق" style relative time (Arabic, Latin digits). */
export function timeAgo(iso: string, now = Date.now()): string {
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (m < 1) return 'الآن';
  if (m < 60) return m === 1 ? 'منذ دقيقة' : m === 2 ? 'منذ دقيقتين' : `منذ ${m} ${m <= 10 ? 'دقائق' : 'دقيقة'}`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? 'منذ ساعة' : h === 2 ? 'منذ ساعتين' : `منذ ${h} ${h <= 10 ? 'ساعات' : 'ساعة'}`;
  const d = Math.round(h / 24);
  return d === 1 ? 'أمس' : d === 2 ? 'منذ يومين' : `منذ ${d} ${d <= 10 ? 'أيام' : 'يوم'}`;
}

/**
 * Header bell + notifications page.
 * GET /notifications · POST /notifications/:id/read · POST /notifications/read-all · DELETE /notifications/:id
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiService);
  private mock = mockNotifications();
  private readonly _items = signal<AppNotification[]>([]);
  readonly items = this._items.asReadonly();
  readonly unread = computed(() => this._items().filter((n) => !n.read).length);
  readonly loading = signal(false);
  private loaded = false;

  constructor() {
    // Logging out clears the list so the next user never sees the previous user's notifications.
    const auth = inject(AuthService);
    effect(() => { if (!auth.token()) untracked(() => this.reset()); });
  }

  /** Loads once per session; pass force to refresh. */
  load(force = false) {
    if ((this.loaded && !force) || this.loading()) return;
    this.loading.set(true);
    this.api.get<AppNotification[]>('/notifications', undefined, () => structuredClone(this.mock)).subscribe({
      next: (r) => { this._items.set([...r].sort((a, b) => b.at.localeCompare(a.at))); this.loaded = true; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  markRead(id: number) {
    const n = this._items().find((x) => x.id === id);
    if (!n || n.read) return;
    this.patch(id, { read: true });
    this.api.post(`/notifications/${id}/read`, {}, () => { this.mockPatch(id, { read: true }); return null; })
      .subscribe({ error: () => this.patch(id, { read: false }) });
  }
  markAllRead() {
    const before = this._items();
    this._items.update((l) => l.map((n) => ({ ...n, read: true })));
    this.api.post('/notifications/read-all', {}, () => { this.mock = this.mock.map((n) => ({ ...n, read: true })); return null; })
      .subscribe({ error: () => this._items.set(before) });
  }
  remove(id: number) {
    const before = this._items();
    this._items.update((l) => l.filter((n) => n.id !== id));
    this.api.delete(`/notifications/${id}`, () => { this.mock = this.mock.filter((n) => n.id !== id); })
      .subscribe({ error: () => this._items.set(before) });
  }
  /** Called on logout so the next user never sees the previous user's list. */
  reset() { this._items.set([]); this.loaded = false; this.mock = mockNotifications(); }

  private patch(id: number, p: Partial<AppNotification>) { this._items.update((l) => l.map((n) => (n.id === id ? { ...n, ...p } : n))); }
  private mockPatch(id: number, p: Partial<AppNotification>) { this.mock = this.mock.map((n) => (n.id === id ? { ...n, ...p } : n)); }
}
