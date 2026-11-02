import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EmployeeFilter } from '../../shared/data/models';
import { LookupsService } from '../../shared/data/lookups.service';
import { SelectField, TextField } from '../../shared/ui/fields';
import { Icon } from '../../shared/ui/icon';

/** Search box + basic filters + collapsible advanced filters. Shared by /employees and /employees/browse. */
@Component({
  selector: 'app-employee-filters',
  imports: [FormsModule, SelectField, TextField, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card shadow-sm p-5">
      <div class="flex items-center gap-4 mb-4">
        <div class="flex-1 relative">
          <input type="text" placeholder="ابحث بالاسم أو رقم الموظف..." class="input pl-10 !py-2.5" [(ngModel)]="q" (keyup.enter)="apply()" aria-label="بحث" />
          <app-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button type="button" (click)="expanded.set(!expanded())" class="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark whitespace-nowrap">
          {{ expanded() ? 'إخفاء المرشح المتقدم' : 'المزيد من الفلاتر' }}
          <app-icon [name]="expanded() ? 'chevron-up' : 'chevron-down'" />
        </button>
      </div>
      @if (lk(); as l) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <app-select-field label="القطاع" placeholder="جميع القطاعات" [options]="l.sectors" [(value)]="f.sector" />
          <app-select-field label="الادارة" placeholder="جميع الإدارات" [options]="l.departments" [(value)]="f.department" />
          <app-select-field label="البنك" placeholder="جميع البنوك" [options]="l.banks" [(value)]="f.bank" />
          <app-select-field label="الدرجة الوظيفية" placeholder="جميع الدرجات" [options]="l.grades" [(value)]="f.grade" />
          <app-select-field label="نوع التعيين" placeholder="جميع الأنواع" [options]="l.appointTypes" [(value)]="f.appointType" />
        </div>
        @if (expanded()) {
          <div class="flex flex-col gap-3 mb-4 border-t border-gray-100 pt-4">
            <div class="grid grid-cols-2 gap-3">
              <app-select-field label="الحالة الوظيفية" placeholder="جميع الحالات" [options]="l.jobStatuses" [(value)]="f.jobStatus" />
              <app-select-field label="مركز التكلفة" placeholder="جميع المراكز" [options]="l.costCenters" [(value)]="f.costCenter" />
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <app-text-field kind="date" label="تاريخ الميلاد من" [(value)]="f.birthFrom" />
              <app-text-field kind="date" label="تاريخ الميلاد إلى" [(value)]="f.birthTo" />
              <app-text-field kind="date" label="تاريخ الدرجة من" [(value)]="f.gradeFrom" />
              <app-text-field kind="date" label="تاريخ الدرجة إلى" [(value)]="f.gradeTo" />
              <app-text-field kind="date" label="تاريخ التعيين من" [(value)]="f.appointFrom" />
              <app-text-field kind="date" label="تاريخ التعيين إلى" [(value)]="f.appointTo" />
            </div>
          </div>
        }
      }
      <div class="flex items-center gap-3">
        <button type="button" class="btn-primary !px-6" (click)="apply()"><app-icon name="search" />بحث</button>
        <button type="button" class="btn-outline border-gray-300" (click)="clear()"><app-icon name="refresh" />مسح الفلاتر</button>
      </div>
    </div>
  `,
})
export class EmployeeFilters {
  protected readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly expanded = signal(false);
  protected q = '';
  protected f = this.empty();
  readonly search = output<EmployeeFilter>();

  apply() { this.search.emit({ ...this.f, q: this.q }); }
  clear() { this.q = ''; this.f = this.empty(); this.apply(); }
  private empty() {
    return { sector: '', department: '', bank: '', grade: '', appointType: '', jobStatus: '', costCenter: '', birthFrom: '', birthTo: '', gradeFrom: '', gradeTo: '', appointFrom: '', appointTo: '' };
  }
}
