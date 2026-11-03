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

  /** Working copy (edited) vs. last saved copy. */
  protected readonly rows = signal<Employee[]>([]);
  private saved: Employee[] = [];
  protected readonly editing = signal<{ row: number; field: Field } | null>(null);
  protected readonly edited = computed(() => new Set(this.rows().flatMap((r, i) => (JSON.stringify(r) === JSON.stringify(this.saved[i]) ? [] : [i]))));
  protected readonly saving = signal(false);

  constructor() {
    this.list.load();
    effect(() => { const r = this.list.rows(); this.saved = structuredClone(r); this.rows.set(structuredClone(r)); });
  }

  onSearch(f: EmployeeFilter) { this.filter = f; this.list.search(); }
  isEditing(i: number, f: Field) { const e = this.editing(); return e?.row === i && e.field === f; }
  update(i: number, f: Field, v: string) { this.rows.update((rs) => rs.map((r, k) => (k === i ? { ...r, [f]: v } : r))); }

  save() {
    const changed = [...this.edited()].map((i) => this.rows()[i]);
    this.saving.set(true);
    this.svc.saveMany(changed).subscribe({
      next: () => { this.saved = structuredClone(this.rows()); this.rows.set([...this.rows()]); this.editing.set(null); this.saving.set(false); this.toast.success('تم حفظ التعديلات'); },
      error: () => { this.saving.set(false); this.toast.error('تعذر حفظ التعديلات'); },
    });
  }
  cancel() { this.rows.set(structuredClone(this.saved)); this.editing.set(null); }
}
