import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from './icon';

/** Loading / error / empty row for tables. Place inside <tbody>. */
@Component({
  selector: 'tr[appTableState]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <td [attr.colspan]="cols()" class="px-4 py-12 text-center">
      @if (loading()) {
        <div class="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span class="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin"></span>
          جاري التحميل...
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center gap-2 text-sm text-red-500">
          <app-icon name="alert-circle" [size]="22" />
          <span>حدث خطأ أثناء تحميل البيانات</span>
          <button type="button" class="btn-outline !py-1.5" (click)="retry.emit()"><app-icon name="refresh" /> إعادة المحاولة</button>
        </div>
      } @else {
        <p class="text-sm font-semibold text-gray-400">{{ emptyText() }}</p>
      }
    </td>
  `,
})
export class TableState {
  readonly cols = input(1);
  readonly loading = input(false);
  readonly error = input(false);
  readonly emptyText = input('لا توجد بيانات');
  readonly retry = output<void>();
}
