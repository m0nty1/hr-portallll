/* Domain models shared by services and pages. Field names = the JSON contract in API_CONTRACT.md. */

export type JobStatus = 'عامل' | 'موقوف';
export interface Employee {
  code: string; name: string; jobStatus: JobStatus; appointType: string; appointDate: string;
  grade: string; gradeDate: string; bank: string; basic: string; birthDate: string; department?: string;
}
export interface EmployeeFilter {
  q?: string; sector?: string; department?: string; bank?: string; grade?: string; appointType?: string;
  jobStatus?: string; costCenter?: string; birthFrom?: string; birthTo?: string; gradeFrom?: string; gradeTo?: string;
  appointFrom?: string; appointTo?: string; page?: number; pageSize?: number;
}
export interface FamilyMember { name: string; relation: string; dob: string; }
export interface RaiseRow { date: string; base: string; value: string; }
export interface EmployeeProfile {
  code: string; name: string; jobTitle: string; active: boolean; nationalId: string; birthDate: string;
  org: Record<string, string>; personal: Record<string, string>; family: FamilyMember[];
  job: Record<string, string>; raises: RaiseRow[];
}
export interface SalaryVariables {
  fields: { label: string; value: string; badge?: boolean }[];
  cashAllowance: { label: string; value: string }[];
  disability: string; endOfService: string; socialAid: string;
}

export type LeaveType = 'اعتيادي' | 'مرضي' | 'عارضة' | 'مأمورية';
export interface AbsenceRow { id: number; name: string; type: LeaveType; days: number; from: string; to: string; }
export type PenaltyType = 'حرمان من مكافأة' | 'خصم مالي' | 'إنذار' | 'خصم يوم';
export interface PenaltyRow { id: number; name: string; type: PenaltyType; penaltyDate: string; days: number; decisionNo: string; decisionDate: string; reason: string; }

export type ItemType = 'استحقاق' | 'استقطاع' | 'أخرى';
export type CalcMethod = 'قيمة' | 'نسبة' | 'حساب';
export interface SalaryItem { id: number; code: string; type: ItemType; name: string; calculation: CalcMethod; value: string; dependsOn: string; installmentType: string; order: string; hasDetails: boolean; }
export interface SalaryItemGroup { code: string; name: string; }
export interface ItemDependency { code: string; name: string; type: ItemType; order: string; }
export interface EmployeeItem { code: string; name: string; group: string; calculation: '' | 'قيمة' | 'نسبة'; value: string; active: boolean; allocated: boolean; }
export interface AllocationItem { code: string; name: string; group: string; }

export interface Installment { name: string; desc: string; value: string; from: string; count: string; total: string; notes: string; }
export interface IncentiveSheet { id: number; payment: string; dept: string; date: string; notes: string; }
export interface IncentiveLine { name: string; basic: string; abstract: string; duration: string; ratio: string; entitled: string; deductPct: string; total: string; insurance: string; tax: string; net: string; }
export interface IncentiveSheetDetails { serial: string; date: string; department: string; payType: string; ratio: string; totalEntitled: string; totalNet: string; notes: string; lines: IncentiveLine[]; }
export interface NonStaffDisbursement { id: number; type: string; dept: string; date: string; employees: number; total: string; notes: string; ratio: string; }
export interface NonStaffLine { code: string; name: string; dept: string; basic: string; incentive: string; deductions: string; net: string; }
export interface PayrollSummary { calculated: number; totalEntitlements: string; totalDeductions: string; totalNet: string; notCalculated: number; }
export interface EmployeeRate { id: number; name: string; percentage: string; }

export interface Bank { name: string; group: string; }
export interface ExcelGroup { name: string; code: string; }
export interface CostCenter { code: string; name: string; rank: string; }
export interface Department { code: string; name: string; manager: string; }
export interface CodeName { code: number; name: string; }
export interface PeriodicAllowanceRow { name: string; date: string; rate: string; }

export interface Lookups {
  sectors: string[]; departments: string[]; banks: string[]; grades: string[]; appointTypes: string[];
  jobStatuses: string[]; costCenters: string[]; employees: string[]; itemGroups: string[]; disbursementTypes: string[];
  incentiveTypes: string[]; months: string[]; years: string[]; fiscalYears: string[];
}
export interface HomeStats { employees: number; pendingRequests: number; noTax: number; noPension: number; monthlyReports: number; activeDepartments: number; }
