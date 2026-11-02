import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageHeader } from './page-header';

/** Used for routes whose screens are not designed yet. Title comes from route data. */
@Component({
  selector: 'app-placeholder-page',
  imports: [PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="title" [breadcrumb]="[{ label: title }]" />
    <main class="flex-1 flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <p class="text-gray-300 text-lg font-medium">{{ title }}</p>
        <p class="text-gray-300 text-xs mt-1">الصفحة قيد التصميم</p>
      </div>
    </main>
  `,
})
export class PlaceholderPage {
  protected readonly title: string = inject(ActivatedRoute).snapshot.data['title'] ?? '';
}
