import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmployeesService } from '../../shared/data/employees.service';
import { Employee, EmployeeFilter } from '../../shared/data/models';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { Pagination } from '../../shared/ui/pagination';
import { TableState } from '../../shared/ui/table-state';
import { ListState } from '../../shared/util/list-state';
import { EmployeeFilters } from './employee-filters';
import { JobStatusBadge } from './job-status-badge';

@Component({
  selector: 'app-employee-search',
  imports: [PageHeader, EmployeeFilters, Pagination, TableState, Icon, RouterLink, JobStatusBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-search.html',
})
export class EmployeeSearch {
  private readonly svc = inject(EmployeesService);
  private filter: EmployeeFilter = {};
  protected readonly list = new ListState<Employee>((page, pageSize) => this.svc.search({ ...this.filter, page, pageSize }));
  protected readonly cols = ['كود الموظف', 'اسم الموظف', 'الحالة الوظيفية', 'نوع التعيين', 'تاريخ التعيين', 'الدرجة الوظيفية', 'تاريخ الدرجة', 'البنك', 'المرتب الأساسي', 'تاريخ الميلاد'];

  constructor() { this.list.load(); }
  onSearch(f: EmployeeFilter) { this.filter = f; this.list.search(); }
}
