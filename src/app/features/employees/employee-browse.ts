import { AuthService } from '../../core/auth/auth.service';
import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../shared/data/lookups.service';
import { EmployeesService } from '../../shared/data/employees.service';
import { Employee, EmployeeFilter } from '../../shared/data/models';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { ToastService } from '../../shared/ui/toast';
import { ListState } from '../../shared/util/list-state';
import { EmployeeFilters } from './employee-filters';
import { JobStatusBadge } from './job-status-badge';

type Field = Exclude<keyof Employee, 'code' | 'department'>;
interface Col { field: Field; label: string; options?: string[]; date?: boolean; }

@Component({
  selector: 'app-employee-browse',
  imports: [AppDatePipe, PageHeader, EmployeeFilters, Pagination, TableState, Icon, FormsModule, JobStatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-browse.html',
})
export class EmployeeBrowse {
  private readonly svc = inject(EmployeesService);
  private readonly toast = inject(ToastService);
  protected readonly canEdit = inject(AuthService).can('hr.edit');
  private filter: EmployeeFilter = {};
  protected readonly list = new ListState<Employee>((page, pageSize) => this.svc.search({ ...this.filter, page, pageSize }));

  private readonly lk = toSignal(inject(LookupsService).all$);
  /** Dropdown options come from the settings tables (single source of truth). */
  protected readonly cols = computed<Col[]>(() => [
    { field: 'name', label: 'اسم الموظف' },
    { field: 'jobStatus', label: 'الحالة الوظيفية', options: ['عامل', 'موقوف'] },
    { field: 'appointType', label: 'نوع التعيين', options: this.lk()?.appointTypes ?? [] },
    { field: 'appointDate', label: 'تاريخ التعيين', date: true },
    { field: 'grade', label: 'الدرجة الوظيفية', options: this.lk()?.grades ?? [] },
    { field: 'gradeDate', label: 'تاريخ الدرجة', date: true },
    { field: 'bank', label: 'البنك', options: this.lk()?.banks ?? [] },
    { field: 'basic', label: 'المرتب الأساسي' },
    { field: 'birthDate', label: 'تاريخ الميلاد', date: true },
  ]);

  /** Read-only by default; the edit button opens one row at a time (light orange) with save/cancel. */
  protected readonly rows = signal<Employee[]>([]);
  protected readonly editRow = signal<number | null>(null);
  protected draft = {} as Employee;
  protected readonly saving = signal(false);

  constructor() {
    this.list.load();
    effect(() => { const r = this.list.rows(); this.rows.set(structuredClone(r)); this.editRow.set(null); });
  }

  onSearch(f: EmployeeFilter) { this.filter = f; this.list.search(); }
  edit(i: number) { this.draft = structuredClone(this.rows()[i]); this.editRow.set(i); }
  cancel() { this.editRow.set(null); }
  save() {
    const i = this.editRow();
    if (i === null || this.saving()) return;
    const d = structuredClone(this.draft);
    if (!String(d.name ?? '').trim()) { this.toast.error('برجاء إدخال اسم الموظف'); return; }
    this.saving.set(true);
    this.svc.saveMany([d]).subscribe({
      next: () => { this.rows.update((rs) => rs.map((r, k) => (k === i ? d : r))); this.editRow.set(null); this.saving.set(false); this.toast.success('تم حفظ التعديلات'); },
      error: () => { this.saving.set(false); this.toast.error('تعذر حفظ التعديلات'); },
    });
  }
}
