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
  /** PUT /employees/batch — inline edits from the browse screen (all rows succeed or none). */
  saveMany(rows: Employee[]) {
    return this.api.put('/employees/batch', rows, () => {
      for (const r of rows) { const i = MOCK_EMPLOYEES.findIndex((e) => e.code === r.code); if (i >= 0) MOCK_EMPLOYEES[i] = { ...r }; }
      return { updated: rows.length };
    });
  }
  /** GET /employees/:code */
  profile(id: string): Observable<EmployeeProfile> { return this.api.get(`/employees/${id}`, undefined, () => this.mockProfile(id)); }
  /** PUT /employees/:code */
  saveProfile(id: string, p: EmployeeProfile) { return this.api.put(`/employees/${id}`, p, () => { this.profiles.set(id, structuredClone(p)); return p; }); }
  /** GET /employees/:code/salary-variables */
  salaryVariables(id: string): Observable<SalaryVariables> { return this.api.get(`/employees/${id}/salary-variables`, undefined, () => this.mockSalary(id)); }
  /** PUT /employees/:code/salary-variables */
  saveSalaryVariables(id: string, v: SalaryVariables) { return this.api.put(`/employees/${id}/salary-variables`, v, () => { this.salaries.set(id, structuredClone(v)); return v; }); }

  // ── Mock-only in-memory data, keyed by employee code so each employee has their own record.
  private readonly profiles = new Map<string, EmployeeProfile>();
  private readonly salaries = new Map<string, SalaryVariables>();
  private mockProfile(id: string): EmployeeProfile {
    const saved = this.profiles.get(id);
    if (saved) return saved;
    const e = MOCK_EMPLOYEES.find((x) => x.code === id);
    if (!e) return { ...MOCK_PROFILE, code: id };
    return {
      ...MOCK_PROFILE, code: e.code, name: e.name, birthDate: e.birthDate, active: e.jobStatus === 'عامل',
      org: { ...MOCK_PROFILE.org, 'الادارة': e.department ?? '', 'الدرجة الوظيفية': e.grade, 'تاريخ الدرجة': e.gradeDate, 'نوع التعيين': e.appointType, 'تاريخ التعيين': e.appointDate },
      personal: { ...MOCK_PROFILE.personal, 'كود': e.code, 'اسم الموظف': e.name, 'تاريخ الميلاد': e.birthDate, 'الحالة الوظيفية': e.jobStatus },
    };
  }
  private mockSalary(id: string): SalaryVariables {
    const saved = this.salaries.get(id);
    if (saved) return saved;
    const e = MOCK_EMPLOYEES.find((x) => x.code === id);
    if (!e) return MOCK_SALARY_VARS;
    const set = (label: string, value: string) => ({ ...MOCK_SALARY_VARS.fields.find((f) => f.label === label)!, value });
    return {
      ...MOCK_SALARY_VARS,
      fields: MOCK_SALARY_VARS.fields.map((f) => (f.label === 'الأساسي' ? set('الأساسي', `${e.basic} ج.م`) : f.label === 'البنك' ? set('البنك', e.bank) : f)),
    };
  }
  /** GET /employees/lookup?q= — autocomplete */
  lookup(q: string): Observable<Employee[]> {
    return this.api.get('/employees/lookup', { q }, () => MOCK_EMPLOYEES.filter((e) => !q || e.name.includes(q) || e.code.includes(q)).slice(0, 8));
  }
}
