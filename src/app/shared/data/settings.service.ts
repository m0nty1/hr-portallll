import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import * as M from './mock-data';
import { Bank, CodeName, CostCenter, Department, ExcelGroup, PeriodicAllowanceRow } from './models';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(ApiService);
  banks() { return this.api.get<Bank[]>('/settings/banks', undefined, M.MOCK_BANKS); }
  bankExcelGroups() { return this.api.get<ExcelGroup[]>('/settings/banks/excel-groups', undefined, M.MOCK_EXCEL_GROUPS); }
  costCenters() { return this.api.get<CostCenter[]>('/settings/cost-centers', undefined, M.MOCK_COST_CENTERS); }
  saveCostCenter(c: CostCenter) { return this.api.post('/settings/cost-centers', c, c); }
  deleteCostCenter(code: string) { return this.api.delete(`/settings/cost-centers/${code}`); }
  departments() { return this.api.get<Department[]>('/settings/departments', undefined, M.MOCK_DEPARTMENTS); }
  saveDepartment(d: Department) { return this.api.post('/settings/departments', d, d); }
  deleteDepartment(code: string) { return this.api.delete(`/settings/departments/${code}`); }
  disbursementGroups() { return this.api.get<CodeName[]>('/settings/disbursement-groups', undefined, M.MOCK_DISB_GROUPS); }
  excelGroups() { return this.api.get<CodeName[]>('/settings/excel-groups', undefined, M.MOCK_EXCEL_DISB_GROUPS); }
  taxGroups() { return this.api.get<CodeName[]>('/settings/tax-groups', undefined, M.MOCK_TAX_GROUPS); }
  periodicAllowance(q: { from?: string; to?: string; q?: string }) { return this.api.get<PeriodicAllowanceRow[]>('/settings/periodic-allowance', q, M.MOCK_PERIODIC_ALLOWANCE); }
  refreshPeriodicAllowance(q: { from?: string; to?: string }) { return this.api.post('/settings/periodic-allowance/refresh', q, {}); }
}
