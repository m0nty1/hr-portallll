import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LookupsService } from '../../shared/data/lookups.service';
import { ALL_SECTORS, PERM_ACTIONS, PERM_SECTIONS, PermMatrix, SystemUser, UserGroup, UsersService, UsersStats } from '../../shared/data/users.service';
import { ConfirmService } from '../../shared/ui/confirm';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

export const GROUP_COLORS: Record<string, string> = {
  purple: 'bg-purple-50 text-purple-700', blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700', red: 'bg-red-50 text-red-600', gray: 'bg-gray-100 text-gray-600',
};
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join(' ');

/** مستخدمو النظام (/settings/users): users tab + groups & permissions tab (?tab=groups). */
@Component({
  selector: 'app-system-users',
  imports: [PageHeader, Icon, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="مستخدمو النظام" [breadcrumb]="[{ label: 'الإعدادات' }, { label: 'مستخدمو النظام' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-[11px]">
        @for (k of kpis(); track k.label) {
          <div class="card px-5 py-4 border-t-4" [class]="k.border">
            <p class="text-xs text-gray-500">{{ k.label }}</p>
            <p class="text-2xl font-black text-navy mt-2">{{ k.value }}</p>
          </div>
        }
      </div>

      <section class="card">
        <nav class="flex px-4 border-b border-gray-100" role="tablist">
          @for (t of tabs; track t.key) {
            <button type="button" role="tab" [attr.aria-selected]="current() === t.key" (click)="go(t.key)"
              class="flex items-center gap-2 px-5 h-12 text-sm font-semibold border-b-2 whitespace-nowrap"
              [class]="current() === t.key ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-navy'">
              <app-icon [name]="t.icon" [size]="16" />{{ t.label }}
            </button>
          }
        </nav>
        <p class="flex items-center gap-2 px-5 py-2.5 bg-blue-50/60 text-xs text-gray-600 border-b border-gray-100">
          <app-icon name="lock" [size]="14" class="text-brand" /> تُطبّق صلاحيات المجموعة على بيانات القطاع التابع له كل مستخدم فقط، ولا يرى بيانات القطاعات الأخرى، إلا إذا اختير له «جميع القطاعات».
        </p>

        @if (current() === 'users') {
          <div class="flex flex-wrap items-center gap-3 px-5 py-4">
            <label class="relative flex-1 min-w-56">
              <app-icon name="search" [size]="16" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input id="u-q" class="input !pr-9" placeholder="ابحث بالاسم أو اسم الدخول..." [ngModel]="q()" (ngModelChange)="q.set($event)" />
            </label>
            <select id="u-group" class="input !w-auto min-w-40" [ngModel]="fGroup()" (ngModelChange)="fGroup.set($event)" aria-label="المجموعة">
              <option value="">كل المجموعات</option>@for (g of groups(); track g.id) { <option>{{ g.name }}</option> }
            </select>
            <select id="u-status" class="input !w-auto min-w-32" [ngModel]="fStatus()" (ngModelChange)="fStatus.set($event)" aria-label="الحالة">
              <option value="">كل الحالات</option><option value="active">فعال</option><option value="suspended">موقوف</option>
            </select>
            <button type="button" class="btn-primary" [disabled]="editId() !== null" (click)="addNew()"><app-icon name="plus" [size]="16" /> إضافة مستخدم</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm zebra-table">
              <thead class="table-head"><tr>
                <th class="th">المستخدم</th><th class="th">اسم الدخول</th><th class="th text-center">مجموعة المستخدمين</th><th class="th text-center">القطاع</th>
                <th class="th text-center">الحالة</th><th class="th text-center">آخر دخول</th><th class="th text-center w-36">إجراءات</th>
              </tr></thead>
              <tbody>
                @for (u of shownUsers(); track u.id) {
                  @if (editId() === u.id) {
                    <tr class="row-edit">
                      <td class="td"><div class="flex items-center gap-2">
                        <span class="w-9 h-9 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">{{ initials(draft.name || '؟') }}</span>
                        <input class="input-sm min-w-40" [(ngModel)]="draft.name" placeholder="الاسم" aria-label="اسم المستخدم" />
                      </div></td>
                      <td class="td"><input class="input-sm min-w-36" dir="ltr" [(ngModel)]="draft.username" placeholder="user.name" aria-label="اسم الدخول" /></td>
                      <td class="td text-center"><select class="input-sm" [(ngModel)]="draft.group" aria-label="مجموعة المستخدمين">@for (g of groups(); track g.id) { <option>{{ g.name }}</option> }</select></td>
                      <td class="td text-center"><select class="input-sm" [(ngModel)]="draft.sector" aria-label="القطاع"><option>{{ allSectors }}</option>@for (s of sectors(); track s) { <option>{{ s }}</option> }</select></td>
                      <td class="td text-center"><button type="button" class="switch mx-auto" [class.on]="draft.active" (click)="draft.active = !draft.active" [attr.aria-pressed]="draft.active" aria-label="الحالة"></button></td>
                      <td class="td text-center text-xs text-gray-500">{{ when(u.lastLogin) }}</td>
                      <td class="td"><div class="flex justify-center gap-2">
                        <button type="button" class="icon-btn-save" [disabled]="saving()" (click)="save()" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                        <button type="button" class="icon-btn-cancel" (click)="cancel()" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                      </div></td>
                    </tr>
                  } @else {
                    <tr>
                      <td class="td"><div class="flex items-center gap-2">
                        <span class="w-9 h-9 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">{{ initials(u.name) }}</span>
                        <span class="font-bold text-gray-800">{{ u.name }}</span>
                      </div></td>
                      <td class="td text-gray-700" dir="ltr" style="text-align:right">{{ u.username }}</td>
                      <td class="td text-center"><span class="pill font-semibold" [class]="groupClass(u.group)">{{ u.group }}</span></td>
                      <td class="td text-center">
                        @if (u.sector === allSectors) { <span class="pill bg-orange-50 text-orange-700 font-semibold">{{ u.sector }}</span> }
                        @else { <span class="text-gray-700">{{ u.sector }}</span> }
                      </td>
                      <td class="td text-center">
                        <button type="button" class="switch mx-auto" [class.on]="u.active" [disabled]="editId() !== null || u.id === myId()" (click)="toggleActive(u)"
                          [attr.aria-pressed]="u.active" [attr.aria-label]="(u.active ? 'إيقاف ' : 'تفعيل ') + u.name" [title]="u.active ? 'فعال' : 'موقوف'"></button>
                      </td>
                      <td class="td text-center text-xs" [class]="u.lastLogin ? 'text-gray-700' : 'text-gray-400'">{{ when(u.lastLogin) }}</td>
                      <td class="td"><div class="flex justify-center gap-2">
                        <button type="button" class="icon-btn-edit" [disabled]="editId() !== null" (click)="edit(u)" aria-label="تعديل"><app-icon name="edit" [size]="16" /></button>
                        <a [routerLink]="['/settings/reset-password']" [queryParams]="{ user: u.id }" class="icon-btn border-gray-200 text-gray-600 hover:text-navy" [attr.aria-label]="'إعادة تعيين كلمة مرور ' + u.name" title="إعادة تعيين كلمة المرور"><app-icon name="key" [size]="16" /></a>
                        <button type="button" class="icon-btn-delete" [disabled]="editId() !== null || u.id === myId()" (click)="remove(u)" aria-label="حذف"><app-icon name="delete" [size]="16" /></button>
                      </div></td>
                    </tr>
                  }
                } @empty {
                  <tr><td colspan="7" class="td text-center text-gray-400 py-10">{{ loading() ? 'جاري التحميل...' : 'لا يوجد مستخدمون مطابقون' }}</td></tr>
                }
              </tbody>
            </table>
          </div>
          <p class="px-5 py-3 text-xs text-gray-500">عرض {{ shownUsers().length }} من {{ users().length }} مستخدماً</p>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-[11px] p-[13px]">
            <div class="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
              <h3 class="font-bold text-navy">مجموعات المستخدمين</h3>
              @if (addingGroup()) {
                <form class="flex gap-2" (ngSubmit)="addGroup()">
                  <input id="g-name" name="gname" class="input-sm flex-1" [(ngModel)]="newGroup" placeholder="اسم المجموعة" aria-label="اسم المجموعة الجديدة" />
                  <button type="submit" class="icon-btn-save" aria-label="حفظ"><app-icon name="check" [size]="16" /></button>
                  <button type="button" class="icon-btn-cancel" (click)="addingGroup.set(false)" aria-label="إلغاء"><app-icon name="close" [size]="16" /></button>
                </form>
              } @else {
                <button type="button" class="btn-primary w-full justify-center" (click)="addingGroup.set(true)"><app-icon name="plus" [size]="16" /> إضافة مجموعة جديدة</button>
              }
              <ul class="flex flex-col gap-1.5">
                @for (g of groups(); track g.id) {
                  <li>
                    <button type="button" (click)="pick(g)" class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-right transition-colors"
                      [class]="g.id === selected()?.id ? 'border-brand bg-orange-50/70' : 'border-transparent hover:bg-gray-50'">
                      <span class="pill font-semibold" [class]="colors[g.color] || colors['gray']">{{ g.name }}</span>
                      <span class="text-xs text-gray-500">{{ g.users }} مستخدمين</span>
                    </button>
                  </li>
                }
              </ul>
            </div>
            <div class="lg:col-span-2 border border-gray-100 rounded-xl overflow-hidden">
              @if (selected(); as g) {
                <div class="flex items-center gap-2 px-4 py-3"><h3 class="font-bold text-navy">صلاحيات المجموعة:</h3><span class="pill font-semibold" [class]="colors[g.color] || colors['gray']">{{ g.name }}</span></div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm zebra-table">
                    <thead class="table-head"><tr><th class="th">القسم</th>@for (a of actions; track a.key) { <th class="th text-center">{{ a.label }}</th> }</tr></thead>
                    <tbody>
                      @for (s of sections; track s.key) {
                        <tr>
                          <td class="td font-bold text-gray-800">{{ s.label }}</td>
                          @for (a of actions; track a.key) {
                            <td class="td text-center">
                              @if (s.actions.includes(a.key)) {
                                <input type="checkbox" class="checkbox" [checked]="!!matrix()[s.key]?.[a.key]" (change)="setPerm(s.key, a.key, $any($event.target).checked)" [attr.aria-label]="a.label + ' — ' + s.label" />
                              } @else { <span class="text-gray-300">—</span> }
                            </td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <div class="flex items-center gap-3 px-4 py-4">
                  <button type="button" class="btn-primary" [disabled]="!dirty() || savingPerms()" (click)="savePerms()"><app-icon name="check" [size]="16" /> حفظ الصلاحيات</button>
                  @if (dirty()) { <span class="text-xs text-orange-600">فيه تعديلات لم تحفظ</span> }
                </div>
              } @else {
                <p class="py-16 text-center text-gray-400 text-sm">اختر مجموعة لعرض صلاحياتها</p>
              }
            </div>
          </div>
        }
      </section>
    </main>
  `,
  styles: `
    .switch { position: relative; width: 38px; height: 22px; border-radius: 999px; background: #cbd5e1; transition: background .2s; display: block; }
    .switch::after { content: ''; position: absolute; top: 3px; right: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 2px rgb(0 0 0 / .2); }
    .switch.on { background: var(--color-brand, #f47920); }
    .switch.on::after { transform: translateX(-16px); }
    .switch:disabled { opacity: .5; cursor: not-allowed; }
    .switch:focus-visible { outline: 2px solid var(--color-brand, #f47920); outline-offset: 2px; }
  `,
})
export class SystemUsers {
  readonly tab = input<string>();
  private readonly svc = inject(UsersService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly sectors = computed(() => this.lk()?.sectors ?? ['المركز الرئيسي', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان']);
  protected readonly allSectors = ALL_SECTORS;
  protected readonly initials = initials;
  protected readonly colors = GROUP_COLORS;
  protected readonly tabs = [{ key: 'users', label: 'المستخدمون', icon: 'user' as const }, { key: 'groups', label: 'مجموعات المستخدمين والصلاحيات', icon: 'shield' as const }];
  protected readonly current = computed(() => (this.tab() === 'groups' ? 'groups' : 'users'));
  /** The signed-in user can't suspend or delete their own account (demo: matched by username). */
  protected readonly myId = computed(() => this.users().find((u) => u.username === this.auth.user().username)?.id ?? -1);

  protected readonly users = signal<SystemUser[]>([]);
  protected readonly groups = signal<UserGroup[]>([]);
  protected readonly stats = signal<UsersStats | null>(null);
  protected readonly loading = signal(false);
  protected readonly q = signal('');
  protected readonly fGroup = signal('');
  protected readonly fStatus = signal('');
  protected readonly shownUsers = computed(() => {
    const t = this.q().trim(), g = this.fGroup(), st = this.fStatus(), edit = this.editId();
    return this.users().filter((u) => u.id === edit ||
      ((!t || u.name.includes(t) || u.username.includes(t)) && (!g || u.group === g) && (!st || (st === 'active') === u.active)));
  });
  protected readonly kpis = computed(() => {
    const s = this.stats();
    return [
      { label: 'إجمالي المستخدمين', value: s?.total ?? '—', border: 'border-t-navy' },
      { label: 'مستخدمون فعالون', value: s?.active ?? '—', border: 'border-t-green-600' },
      { label: 'مستخدمون موقوفون', value: s?.suspended ?? '—', border: 'border-t-brand' },
      { label: 'عدد المجموعات', value: s?.groups ?? '—', border: 'border-t-navy' },
    ];
  });

  protected readonly editId = signal<number | null>(null);
  protected draft = {} as SystemUser;
  protected readonly saving = signal(false);

  // ── Groups tab
  protected readonly sections = PERM_SECTIONS;
  protected readonly actions = PERM_ACTIONS;
  protected readonly selected = signal<UserGroup | null>(null);
  protected readonly matrix = signal<PermMatrix>({});
  protected readonly dirty = computed(() => JSON.stringify(this.matrix()) !== JSON.stringify(this.selected()?.permissions ?? {}));
  protected readonly savingPerms = signal(false);
  protected readonly addingGroup = signal(false);
  protected newGroup = '';

  constructor() {
    this.reload();
    effect(() => { this.current(); this.editId.set(null); });
  }
  private reload() {
    this.loading.set(true);
    this.svc.list().subscribe({ next: (u) => { this.users.set(u); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.svc.stats().subscribe((s) => this.stats.set(s));
    this.svc.groups().subscribe((g) => { this.groups.set(g); const sel = this.selected(); this.pick(g.find((x) => x.id === sel?.id) ?? g[1] ?? g[0] ?? null); });
  }
  go(key: string) { this.router.navigate([], { queryParams: { tab: key === 'users' ? null : key }, replaceUrl: true }); }
  groupClass(name: string) { return GROUP_COLORS[this.groups().find((g) => g.name === name)?.color ?? 'gray'] ?? GROUP_COLORS['gray']; }
  when(iso: string) {
    if (!iso) return 'لم يسجل الدخول بعد';
    const d = new Date(iso), p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  addNew() {
    const u: SystemUser = { id: -Date.now(), name: '', username: '', group: this.groups().at(-1)?.name ?? '', sector: this.sectors()[0] ?? ALL_SECTORS, active: true, lastLogin: '' };
    this.users.update((l) => [u, ...l]);
    this.edit(u);
  }
  edit(u: SystemUser) { this.draft = { ...u }; this.editId.set(u.id); }
  cancel() {
    const id = this.editId();
    if (id !== null && id < 0) this.users.update((l) => l.filter((u) => u.id !== id));
    this.editId.set(null);
  }
  save() {
    if (this.saving()) return;
    const d = { ...this.draft, name: this.draft.name.trim(), username: this.draft.username.trim().toLowerCase() };
    if (!d.name) { this.toast.error('برجاء إدخال اسم المستخدم'); return; }
    if (!/^[a-z][a-z0-9._-]{2,}$/.test(d.username)) { this.toast.error('اسم الدخول لازم يكون حروف إنجليزي صغيرة وأرقام ونقطة، 3 حروف على الأقل'); return; }
    if (this.users().some((u) => u.id !== d.id && u.username === d.username)) { this.toast.error('اسم الدخول مستخدم قبل كده'); return; }
    if (!d.group) { this.toast.error('برجاء اختيار مجموعة المستخدمين'); return; }
    const isNew = d.id < 0, tempId = d.id;
    this.saving.set(true);
    this.svc.save(d, isNew).subscribe({
      next: (saved) => {
        this.users.update((l) => l.map((u) => (u.id === tempId ? saved : u)));
        this.editId.set(null); this.saving.set(false);
        this.toast.success(isNew ? 'تمت إضافة المستخدم. حدد له كلمة مرور من «إعادة تعيين كلمة المرور»' : 'تم حفظ المستخدم');
        this.refreshCounts();
      },
      error: () => this.saving.set(false),
    });
  }
  async toggleActive(u: SystemUser) {
    const to = !u.active;
    if (!to && !(await this.dialog.ask({ title: 'إيقاف المستخدم', message: `إيقاف ${u.name}؟ مش هيقدر يدخل البرنامج لحد ما يتفعل تاني.`, confirmText: 'إيقاف', danger: true }))) return;
    this.svc.setActive(u, to).subscribe((s) => {
      this.users.update((l) => l.map((x) => (x.id === u.id ? s : x)));
      this.toast.success(to ? 'تم تفعيل المستخدم' : 'تم إيقاف المستخدم');
      this.refreshCounts();
    });
  }
  async remove(u: SystemUser) {
    if (!(await this.dialog.ask({ title: 'حذف مستخدم', message: `حذف المستخدم ${u.name} (${u.username})؟`, confirmText: 'حذف', danger: true }))) return;
    this.svc.remove(u.id).subscribe(() => { this.users.update((l) => l.filter((x) => x.id !== u.id)); this.toast.success('تم الحذف'); this.refreshCounts(); });
  }
  private refreshCounts() {
    this.svc.stats().subscribe((s) => this.stats.set(s));
    this.svc.groups().subscribe((g) => this.groups.set(g));
  }

  async pick(g: UserGroup | null) {
    if (g && this.selected() && g.id !== this.selected()!.id && this.dirty()
      && !(await this.dialog.ask({ title: 'تعديلات لم تحفظ', message: 'فيه تعديلات على صلاحيات المجموعة الحالية لم تحفظ. تجاهلها؟', confirmText: 'تجاهل' }))) return;
    this.selected.set(g);
    this.matrix.set(structuredClone(g?.permissions ?? {}));
  }
  setPerm(section: string, action: string, on: boolean) {
    this.matrix.update((m) => {
      const next = structuredClone(m);
      next[section] = { ...next[section], [action]: on };
      // Any other right needs "view"; removing "view" removes the rest.
      if (action !== 'view' && on) next[section]['view'] = true;
      if (action === 'view' && !on) for (const k of Object.keys(next[section])) (next[section] as Record<string, boolean>)[k] = false;
      return next;
    });
  }
  savePerms() {
    const g = this.selected();
    if (!g) return;
    this.savingPerms.set(true);
    this.svc.savePermissions(g.id, this.matrix()).subscribe({
      next: (saved) => {
        this.groups.update((l) => l.map((x) => (x.id === saved.id ? saved : x)));
        this.selected.set(saved); this.matrix.set(structuredClone(saved.permissions));
        this.savingPerms.set(false); this.toast.success('تم حفظ الصلاحيات');
      },
      error: () => this.savingPerms.set(false),
    });
  }
  addGroup() {
    const name = this.newGroup.trim();
    if (!name) { this.toast.error('برجاء إدخال اسم المجموعة'); return; }
    if (this.groups().some((g) => g.name === name)) { this.toast.error('المجموعة موجودة قبل كده'); return; }
    this.svc.addGroup(name).subscribe((g) => {
      this.groups.update((l) => [...l, g]); this.newGroup = ''; this.addingGroup.set(false);
      this.selected.set(g); this.matrix.set(structuredClone(g.permissions));
      this.toast.success('تمت إضافة المجموعة. حدد صلاحياتها واحفظ');
      this.svc.stats().subscribe((s) => this.stats.set(s));
    });
  }
}
