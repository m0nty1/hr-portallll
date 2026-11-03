import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Icon } from './icon';

export interface ConfirmOptions { message: string; title?: string; confirmText?: string; danger?: boolean; }
interface Pending extends ConfirmOptions { resolve: (ok: boolean) => void; }

/** Portal-styled replacement for window.confirm(): `if (!(await dialog.ask('حذف؟'))) return;` */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly pending = signal<Pending | null>(null);
  ask(opts: string | ConfirmOptions): Promise<boolean> {
    const o = typeof opts === 'string' ? { message: opts, danger: opts.includes('حذف') } : opts;
    this.pending()?.resolve(false);
    return new Promise((resolve) => this.pending.set({ ...o, resolve }));
  }
  close(ok: boolean) { this.pending()?.resolve(ok); this.pending.set(null); }
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'svc.pending() && svc.close(false)' },
  template: `
    @if (svc.pending(); as p) {
      <div class="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4 no-print" (click)="svc.close(false)">
        <div role="alertdialog" aria-modal="true" aria-labelledby="cf-title" aria-describedby="cf-msg"
          class="card w-full max-w-sm p-5 flex flex-col gap-4" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [class]="p.danger ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-brand'">
              <app-icon [name]="p.danger ? 'delete' : 'alert'" [size]="20" />
            </span>
            <h2 id="cf-title" class="font-bold text-navy">{{ p.title ?? (p.danger ? 'تأكيد الحذف' : 'تأكيد') }}</h2>
          </div>
          <p id="cf-msg" class="text-sm text-gray-600">{{ p.message }}</p>
          <div class="flex gap-2 justify-end">
            <button type="button" class="btn-outline" (click)="svc.close(false)">إلغاء</button>
            <button type="button" class="btn" autofocus [class]="p.danger ? 'bg-red-500 hover:bg-red-600 text-white font-bold' : 'btn-primary'" (click)="svc.close(true)">
              {{ p.confirmText ?? (p.danger ? 'حذف' : 'تأكيد') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog { protected readonly svc = inject(ConfirmService); }
