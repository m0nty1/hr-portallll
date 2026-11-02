import { Injectable, inject } from '@angular/core';
import { ApiService, Page, Query, pageOf } from '../../core/api/api.service';
import * as M from './mock-data';
import {
  AllocationItem, EmployeeItem, EmployeeRate, IncentiveSheet, IncentiveSheetDetails, Installment, ItemDependency,
  NonStaffDisbursement, NonStaffLine, PayrollSummary, SalaryItem, SalaryItemGroup,
} from './models';

@Injectable({ providedIn: 'root' })
export class SalariesService {
  private readonly api = inject(ApiService);

  // ── Salary items  /salary-items
  items(group: string) { return this.api.get<SalaryItem[]>('/salary-items', { group }, M.MOCK_SALARY_ITEMS); }
  saveItem(item: SalaryItem) { return item.id > 1000 ? this.api.post<SalaryItem>('/salary-items', item, item) : this.api.put<SalaryItem>(`/salary-items/${item.id}`, item, item); }
  deleteItem(id: number) { return this.api.delete(`/salary-items/${id}`); }
  itemDependencies(code: string) { return this.api.get<ItemDependency[]>(`/salary-items/${code}/dependencies`, undefined, M.MOCK_DEPENDENCIES); }
  saveDependencies(code: string, deps: ItemDependency[]) { return this.api.put(`/salary-items/${code}/dependencies`, deps, deps); }

  // ── Item groups  /salary-item-groups
  groups() { return this.api.get<SalaryItemGroup[]>('/salary-item-groups', undefined, M.MOCK_ITEM_GROUPS); }
  saveGroup(g: SalaryItemGroup, isNew: boolean) { return isNew ? this.api.post('/salary-item-groups', g, g) : this.api.put(`/salary-item-groups/${g.code}`, g, g); }
  deleteGroup(code: string) { return this.api.delete(`/salary-item-groups/${code}`); }

  // ── Allocation
  employeeItems(employee: string) { return this.api.get<EmployeeItem[]>('/allocations/employee', { employee }, M.MOCK_EMPLOYEE_ITEMS); }
  saveEmployeeItems(employee: string, items: EmployeeItem[]) { return this.api.put('/allocations/employee', { employee, items }, {}); }
  allocationEmployees() { return this.api.get<string[]>('/allocations/employees', undefined, M.MOCK_ALLOCATION_EMPLOYEES); }
  allocationItems() { return this.api.get<AllocationItem[]>('/allocations/items', undefined, M.MOCK_ALLOCATION_ITEMS); }
  /** kind = 'categories' (by appointment type) | 'disbursements' (by disbursement type) */
  allocatedCodes(kind: 'categories' | 'disbursements', key: string) { return this.api.get<string[]>(`/allocations/${kind}`, { key }, M.MOCK_ALLOCATED_CODES); }
  saveAllocated(kind: 'categories' | 'disbursements', key: string, codes: string[]) { return this.api.put(`/allocations/${kind}`, { key, codes }, {}); }

  // ── Installments  /installments
  installmentTypes() { return this.api.get<string[]>('/installments/types', undefined, M.MOCK_INSTALLMENT_TYPES); }
  installments(q: Query) { return this.api.get<Page<Installment>>('/installments', q, () => pageOf(M.MOCK_INSTALLMENTS.filter((r) => !q['employee'] || r.name === q['employee']), +(q['page'] ?? 1), +(q['pageSize'] ?? 10))); }

  // ── Incentive sheets  /incentives
  incentiveSheets(q: Query) { return this.api.get<Page<IncentiveSheet>>('/incentives', q, () => pageOf(M.MOCK_INCENTIVE_SHEETS.filter((r) => !q['department'] || r.dept === q['department']), +(q['page'] ?? 1), +(q['pageSize'] ?? 10))); }
  incentiveSheet(id: string) { return this.api.get<IncentiveSheetDetails>(`/incentives/${id}`, undefined, M.MOCK_INCENTIVE_DETAILS); }
  saveIncentiveSheet(id: string, body: Partial<IncentiveSheetDetails>) { return this.api.put(`/incentives/${id}`, body, {}); }
  /** POST /incentives/:id/actions/:action — load-current-basic | load-previous-basic | basic-salaries | refresh-employees */
  incentiveAction(id: string, action: string) { return this.api.post(`/incentives/${id}/actions/${action}`, {}, {}); }

  // ── Non-staff disbursements  /non-staff
  nonStaff(q: Query) { return this.api.get<Page<NonStaffDisbursement>>('/non-staff', q, () => pageOf(M.MOCK_NON_STAFF.filter((r) => (!q['type'] || r.type === q['type']) && (!q['department'] || r.dept === q['department'])), +(q['page'] ?? 1), +(q['pageSize'] ?? 10))); }
  nonStaffItem(id: number) { return this.api.get<NonStaffDisbursement | undefined>(`/non-staff/${id}`, undefined, () => M.MOCK_NON_STAFF.find((d) => d.id === id)); }
  nonStaffLines(id: number) { return this.api.get<NonStaffLine[]>(`/non-staff/${id}/employees`, undefined, M.MOCK_NON_STAFF_LINES); }

  // ── Payroll calculation  /payroll
  calculate(body: Record<string, string>) { return this.api.post<PayrollSummary>('/payroll/calculate', body, M.MOCK_PAYROLL_SUMMARY); }
  approve(body: Record<string, string>) { return this.api.post('/payroll/approve', body, {}); }

  // ── Fiscal year  /fiscal-years
  grantedCount(year: string) { return this.api.get<number>(`/fiscal-years/${encodeURIComponent(year)}/periodic-raise/count`, undefined, 1185); }
  grantPeriodicRaise(year: string) { return this.api.post(`/fiscal-years/${encodeURIComponent(year)}/periodic-raise`, {}, {}); }

  // ── Periodic raise rates  /periodic-raise-rates
  rates(year: string) { return this.api.get<EmployeeRate[]>('/periodic-raise-rates', { year }, M.MOCK_RATES); }
  rateEmployees() { return this.api.get<string[]>('/periodic-raise-rates/employees', undefined, M.MOCK_RATE_EMPLOYEES); }
  saveRate(year: string, r: EmployeeRate) { return this.api.put('/periodic-raise-rates', { year, ...r }, r); }
  deleteRate(id: number) { return this.api.delete(`/periodic-raise-rates/${id}`); }
}
