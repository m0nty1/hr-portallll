import { CanDirective } from '../../core/auth/permissions';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SalariesService } from '../../shared/data/salaries.service';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ToastService } from '../../shared/ui/toast';

/** Shared by screens 15 (by appointment type) and 16 (by disbursement type) – "ItemAllocationTable". */
@Component({
  selector: 'app-item-allocation-table',
  imports: [CanDirective, PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="title()" [breadcrumb]="[{ label: 'المرتبات' }, { label: title() }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] flex flex-col lg:flex-row items-end gap-3">
        <label class="flex flex-col gap-1 flex-1 w-full"><span class="field-label">{{ filterLabel() }}</span>
          <select class="input" [ngModel]="key()" (ngModelChange)="key.set($event)">@for (o of options(); track o) { <option>{{ o }}</option> }</select>
        </label>
        <label class="flex flex-col gap-1 flex-1 w-full"><span class="field-label">المجموعة الرئيسية للبند</span>
          <select class="input" [ngModel]="group()" (ngModelChange)="group.set($event)"><option value="">الكل</option>@for (g of groups(); track g) { <option>{{ g }}</option> }</select>
        </label>
        <button type="button" class="btn-primary" (click)="toast.success('حدد البنود من الجدول')"><app-icon name="plus" [size]="16" /> إضافة بند</button>
        <button *appCan="'salaries.edit'" type="button" class="btn-navy" [disabled]="saving()" (click)="save()"><app-icon name="save" [size]="16" /> {{ saving() ? 'جاري الحفظ...' : 'حفظ التخصيص' }}</button>
      </section>
      <section class="card">
        <table class="w-full text-sm zebra-table">
          <thead class="table-head"><tr>
            <th class="th">كود البند</th><th class="th">اسم البند</th><th class="th text-center">المجموعة الرئيسية للبند</th>
            <th class="th text-center w-24"><input type="checkbox" class="checkbox" aria-label="تحديد الكل" [ngModel]="all()" (ngModelChange)="toggleAll($event)" /></th>
          </tr></thead>
          <tbody>
            @for (i of view(); track i.code) {
              <tr>
                <td class="td font-bold text-navy">{{ i.code }}</td><td class="td">{{ i.name }}</td>
                <td class="td text-center"><span class="pill bg-white border border-gray-200 text-gray-600 font-normal">{{ i.group }}</span></td>
                <td class="td text-center"><input type="checkbox" class="checkbox" [attr.aria-label]="'تخصيص ' + i.name" [checked]="codes().has(i.code)" (change)="toggle(i.code)" /></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="flex justify-between px-5 py-3 text-sm text-gray-500">
          <span>تم تخصيص <b class="text-brand">{{ codes().size }}</b> من {{ items().length }} بنود</span>
          <span>{{ filterLabel() }}: <b class="text-navy">{{ key() }}</b></span>
        </div>
      </section>
    </main>
  `,
})
export class ItemAllocationTable {
  readonly kind = input.required<'categories' | 'disbursements'>();
  readonly title = input.required<string>();
  readonly filterLabel = input.required<string>();
  readonly options = input.required<string[]>();

  private readonly svc = inject(SalariesService);
  protected readonly toast = inject(ToastService);
  protected readonly items = toSignal(this.svc.allocationItems(), { initialValue: [] });
  protected readonly groups = computed(() => [...new Set(this.items().map((i) => i.group))]);
  protected readonly key = signal('');
  protected readonly group = signal('');
  protected readonly codes = signal(new Set<string>());
  protected readonly view = computed(() => this.items().filter((i) => !this.group() || i.group === this.group()));
  protected readonly all = computed(() => this.view().length > 0 && this.view().every((i) => this.codes().has(i.code)));

  constructor() {
    effect(() => { if (!this.key() && this.options().length) this.key.set(this.options()[0]); });
    effect((onCleanup) => { const k = this.key(); if (!k) return; const sub = this.svc.allocatedCodes(this.kind(), k).subscribe((c) => this.codes.set(new Set(c))); onCleanup(() => sub.unsubscribe()); });
  }
  toggle(c: string) { this.codes.update((s) => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; }); }
  toggleAll(on: boolean) { this.codes.update((s) => { const n = new Set(s); this.view().forEach((i) => (on ? n.add(i.code) : n.delete(i.code))); return n; }); }
  protected readonly saving = signal(false);
  save() {
    if (this.saving() || !this.key()) return;
    this.saving.set(true);
    this.svc.saveAllocated(this.kind(), this.key(), [...this.codes()]).subscribe({
      next: () => { this.saving.set(false); this.toast.success('تم حفظ التخصيص'); },
      error: () => this.saving.set(false),
    });
  }
}
