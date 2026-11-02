import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { EmployeesService } from '../../shared/data/employees.service';
import { Employee, SalaryVariables } from '../../shared/data/models';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { SalaryVariablesCard } from '../employees/salary-variables-card';

/** Screen 17 – المرتب والبدلات (/salaries/payroll). Employee autocomplete (S3) → info strip + salary-variables component (shared with profile tab 06c). */
@Component({
  selector: 'app-salary-allowances',
  imports: [PageHeader, Icon, FormsModule, SalaryVariablesCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="المرتب والبدلات" [breadcrumb]="[{ label: 'المرتبات' }, { label: 'المرتب والبدلات' }]" />
    <main class="p-[13px] flex flex-col gap-[11px]">
      <section class="card p-[17px] !overflow-visible relative z-10">
        <label class="flex flex-col gap-1 relative"><span class="field-label">اسم الموظف</span>
          <input class="input !pl-10" [ngModel]="q()" (ngModelChange)="q.set($event); open.set(true)" (keydown.enter)="search()" placeholder="ابحث باسم الموظف أو كوده..." autocomplete="off" />
          <app-icon name="search" [size]="16" class="absolute left-3 bottom-3 text-gray-400" />
          @if (open() && q().trim()) {
            <ul class="absolute top-full mt-1 inset-x-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto" role="listbox">
              @for (m of matches(); track m.code) {
                <li role="option" class="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-orange-50" (mousedown)="pick(m)">
                  <span class="text-xs text-gray-400 w-12">{{ m.code }}</span><span class="text-gray-800">{{ m.name }}</span>
                </li>
              } @empty {
                <li class="px-3 py-4 text-center text-sm text-gray-400">لا يوجد موظف بهذا الاسم</li>
              }
            </ul>
          }
        </label>
        <div class="flex gap-2 mt-4">
          <button type="button" class="btn-primary" (click)="search()"><app-icon name="search" [size]="16" /> بحث</button>
          <button type="button" class="btn-outline" (click)="reset()"><app-icon name="refresh" [size]="16" /> مسح</button>
        </div>
      </section>

      @if (selected()) {
        <section class="card px-[21px] py-[13px] flex flex-wrap items-center gap-x-10 gap-y-2">
          <h2 class="text-lg font-bold text-navy">{{ selected() }}</h2>
          <div class="text-sm"><p class="text-xs text-gray-400">كود الموظف</p><p class="font-bold text-gray-700">{{ code() }}</p></div>
          <div class="text-sm"><p class="text-xs text-gray-400">الإدارة</p><p class="font-bold text-gray-700">{{ dept() || '—' }}</p></div>
        </section>
        <app-salary-variables [data]="vars()" />
      } @else {
        <section class="card p-10 text-center text-sm text-gray-400">اختر موظف لعرض بيانات المرتب والبدلات</section>
      }
    </main>
  `,
})
export class SalaryAllowances {
  private readonly emp = inject(EmployeesService);
  protected readonly q = signal('');
  protected readonly open = signal(false);
  protected readonly selected = signal('');
  protected readonly code = signal('');
  protected readonly dept = signal('');
  protected readonly vars = signal<SalaryVariables | undefined>(undefined);
  /** S3 – autocomplete: GET /employees?q=…&pageSize=8 */
  protected readonly matches = toSignal(toObservable(this.q).pipe(
    debounceTime(150), switchMap((q) => this.emp.search({ q, pageSize: 8 })), map((p) => p.items)), { initialValue: [] as Employee[] });

  pick(m: Employee) {
    this.q.set(m.name); this.open.set(false);
    this.selected.set(m.name); this.code.set(m.code); this.dept.set(m.department ?? '');
    this.emp.salaryVariables(m.code).subscribe((v) => this.vars.set(v));
  }
  search() {
    const first = this.matches()[0];
    if (first) this.pick(first); else this.open.set(true);
  }
  reset() { this.q.set(''); this.selected.set(''); this.open.set(false); }
}
