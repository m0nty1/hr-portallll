import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Icon } from './icon';

export interface ToastMsg { id: number; text: string; kind: 'success' | 'error'; }

/** Usage: inject(ToastService).success('تم حفظ التعديلات') */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly items = signal<ToastMsg[]>([]);
  private seq = 0;
  success(text: string) { this.push(text, 'success'); }
  error(text: string) { this.push(text, 'error'); }
  private push(text: string, kind: ToastMsg['kind']) {
    const id = ++this.seq;
    this.items.update((l) => [...l, { id, text, kind }]);
    setTimeout(() => this.items.update((l) => l.filter((t) => t.id !== id)), 2500);
  }
}

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-5 left-5 z-50 flex flex-col gap-2 no-print" aria-live="polite">
      @for (t of toast.items(); track t.id) {
        <div class="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-lg"
          [class]="t.kind === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'">
          <app-icon [name]="t.kind === 'success' ? 'check-circle' : 'alert-circle'" />
          {{ t.text }}
        </div>
      }
    </div>
  `,
})
export class Toasts { protected readonly toast = inject(ToastService); }
