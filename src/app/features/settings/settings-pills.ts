import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SETTINGS } from './settings-catalog';

/** Pill strip with every system setting – top of screens 27 and 28. */
@Component({
  selector: 'app-settings-pills',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="card p-[13px] flex flex-wrap gap-2 no-print" aria-label="الإعدادات">
      @for (s of items; track s.n) {
        <a [routerLink]="s.to" [queryParams]="s.query ?? null" class="px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-colors"
          [class]="s.n === active() ? 'bg-navy border-navy text-white font-bold' : 'bg-white border-gray-200 text-gray-600 hover:border-brand hover:text-brand'">{{ s.title }}</a>
      }
    </nav>
  `,
})
export class SettingsPills {
  readonly active = input<number>(0);
  protected readonly items = SETTINGS;
}
