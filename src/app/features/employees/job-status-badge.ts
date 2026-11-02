import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-job-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pill !px-2 !py-0.5" [class]="status() === 'عامل' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
      <span class="w-1.5 h-1.5 rounded-full" [class]="status() === 'عامل' ? 'bg-green-500' : 'bg-red-500'"></span>{{ status() }}
    </span>
  `,
})
export class JobStatusBadge { readonly status = input.required<string>(); }
