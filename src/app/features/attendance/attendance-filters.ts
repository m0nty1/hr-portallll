import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LookupsService } from '../../shared/data/lookups.service';
import { SelectField, TextField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';
import { ToastService } from '../../shared/ui/toast';

export interface AttendanceFilter { department: string; employee: string; type: string; from: string; to: string; }

/** Shared filter card for screens 03 (الغياب) and 04 (الجزاءات). */
@Component({
  selector: 'app-attendance-filters',
  imports: [SelectField, TextField, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card p-[17px] no-print">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <app-select-field label="الإدارة" placeholder="** جميع الإدارات **" [options]="lk()?.departments ?? []" [(value)]="department" />
        <app-select-field label="اسم الموظف" placeholder="** جميع الموظفين **" [options]="lk()?.employees ?? []" [(value)]="employee" />
        <app-select-field [label]="typeLabel()" placeholder="** جميع الأنواع **" [options]="types()" [(value)]="type" />
        <app-text-field [label]="fromLabel()" kind="date" [(value)]="from" />
        <app-text-field [label]="toLabel()" kind="date" [(value)]="to" />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 mt-4">
        <div class="flex gap-2">
          <ng-content select="[start]" />
          <button type="button" class="btn-primary" [class]="navySearch() ? '!bg-navy hover:!bg-navy-light' : ''" (click)="emit()"><app-icon name="search" [size]="16" /> بحث</button>
          <button type="button" class="btn-outline" (click)="reset()"><app-icon name="refresh" [size]="16" /> مسح</button>
        </div>
        <div class="flex gap-2">
          <button type="button" class="btn-outline" (click)="exportX.emit()">{{ exportLabel() }}</button>
          <button type="button" class="btn-outline" (click)="print.emit()">طباعة</button>
        </div>
      </div>
    </section>
  `,
})
export class AttendanceFilters {
  readonly types = input<string[]>([]);
  readonly typeLabel = input('النوع');
  readonly fromLabel = input('الفترة من');
  readonly toLabel = input('الفترة إلى');
  readonly exportLabel = input('تصدير Excel');
  readonly navySearch = input(false);
  readonly search = output<AttendanceFilter>();
  readonly exportX = output();
  readonly print = output();

  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly department = signal('');
  protected readonly employee = signal('');
  protected readonly type = signal('');
  /** Default period = start of the current year → end of the current month. */
  private static monthRange() {
    const d = new Date(), y = d.getFullYear(), m = d.getMonth();
    const iso = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    return { from: iso(new Date(y, 0, 1)), to: iso(new Date(y, m + 1, 0)) };
  }
  protected readonly from = signal(AttendanceFilters.monthRange().from);
  protected readonly to = signal(AttendanceFilters.monthRange().to);
  private readonly toast = inject(ToastService);

  protected emit() {
    if (this.from() && this.to() && this.from() > this.to()) { this.toast.error('تاريخ البداية لازم يكون قبل تاريخ النهاية'); return; }
    this.search.emit({ department: this.department(), employee: this.employee(), type: this.type(), from: this.from(), to: this.to() });
  }
  /** Clears every filter, including the period (back to the default period). */
  protected reset() {
    const r = AttendanceFilters.monthRange();
    this.department.set(''); this.employee.set(''); this.type.set(''); this.from.set(r.from); this.to.set(r.to);
    this.emit();
  }
}
