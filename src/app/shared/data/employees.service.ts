import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, Page, pageOf } from '../../core/api/api.service';
import { MOCK_EMPLOYEES, MOCK_HOME_STATS, MOCK_PROFILE, MOCK_SALARY_VARS } from './mock-data';
import { Employee, EmployeeFilter, EmployeeProfile, HomeStats, SalaryVariables } from './models';

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly api = inject(ApiService);

  /** GET /dashboard/stats */
  homeStats(): Observable<HomeStats> { return this.api.get('/dashboard/stats', undefined, MOCK_HOME_STATS); }

  /** GET /employees?q=&department=&...&page=&pageSize= */
  search(f: EmployeeFilter): Observable<Page<Employee>> {
    return this.api.get('/employees', { ...f }, () => {
      const q = (f.q ?? '').trim();
      const rows = MOCK_EMPLOYEES.filter((e) =>
        (!q || e.name.includes(q) || e.code.includes(q)) &&
        (!f.department || e.department === f.department) && (!f.bank || e.bank === f.bank) &&
        (!f.grade || e.grade === f.grade) && (!f.appointType || e.appointType === f.appointType) &&
        (!f.jobStatus || e.jobStatus === f.jobStatus));
      return pageOf(rows, f.page, f.pageSize);
    });
  }
  /** PUT /employees/bulk — inline edits from the browse screen. */
  saveMany(rows: Employee[]) { return this.api.put('/employees/bulk', rows, { updated: rows.length }); }
  /** GET /employees/:id */
  profile(id: string): Observable<EmployeeProfile> { return this.api.get(`/employees/${id}`, undefined, MOCK_PROFILE); }
  /** GET /employees/:id/salary-variables */
  /** PUT /employees/:id */
  saveProfile(id: string, p: EmployeeProfile) { return this.api.put(`/employees/${id}`, p, p); }
  /** PUT /employees/:id/salary-variables */
  saveSalaryVariables(id: string, v: SalaryVariables) { return this.api.put(`/employees/${id}/salary-variables`, v, v); }
  salaryVariables(id: string): Observable<SalaryVariables> { return this.api.get(`/employees/${id}/salary-variables`, undefined, MOCK_SALARY_VARS); }
  /** GET /employees/lookup?q= — autocomplete */
  lookup(q: string): Observable<Employee[]> {
    return this.api.get('/employees/lookup', { q }, () => MOCK_EMPLOYEES.filter((e) => !q || e.name.includes(q) || e.code.includes(q)).slice(0, 8));
  }
}
