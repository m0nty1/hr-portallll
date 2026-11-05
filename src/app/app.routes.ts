import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permissions';
import { Login } from './core/auth/login';
import { Shell } from './core/layout/shell';
import { PlaceholderPage } from './shared/ui/placeholder-page';

/** Route for a screen that is not designed yet — renders the placeholder template. */
const stub = (path: string, title: string) => ({ path, component: PlaceholderPage, data: { title }, title });


export const routes: Routes = [
  { path: 'login', component: Login, title: 'تسجيل الدخول' },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    canActivateChild: [permissionGuard],
    children: [
      { path: '', title: 'الرئيسية', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
      { path: 'notifications', title: 'الإشعارات', loadComponent: () => import('./features/account/notifications.page').then((m) => m.NotificationsPage) },
      { path: 'account', title: 'الملف الشخصي', loadComponent: () => import('./features/account/account.page').then((m) => m.AccountPage) },

      // ── الموارد البشرية
      { path: 'employees', title: 'البحث عن موظف', loadComponent: () => import('./features/employees/employee-search').then((m) => m.EmployeeSearch) },
      { path: 'employees/browse', title: 'استعراض الموظفين', loadComponent: () => import('./features/employees/employee-browse').then((m) => m.EmployeeBrowse) },
      { path: 'employees/:id', title: 'ملف الموظف', loadComponent: () => import('./features/employees/employee-profile').then((m) => m.EmployeeProfile) },
      { path: 'attendance/absence', title: 'كشف الغياب', loadComponent: () => import('./features/attendance/absence-report').then((m) => m.AbsenceReport) },
      { path: 'attendance/penalties', title: 'الجزاءات', loadComponent: () => import('./features/attendance/penalties-report').then((m) => m.PenaltiesReport) },
      { path: 'hr/promotions', title: 'كشوف الترقيات', loadComponent: () => import('./features/hr/promotions').then((m) => m.Promotions) },
      stub('attendance', 'الحضور والانصراف'),

      // ── المرتبات والحوافز
      stub('salaries', 'المرتبات والحوافز'),
      { path: 'salaries/items', title: 'بنود المرتبات', loadComponent: () => import('./features/salaries/salary-items').then((m) => m.SalaryItems) },
      { path: 'salaries/items/:code', title: 'تفاصيل بند المرتب', loadComponent: () => import('./features/salaries/salary-item-details').then((m) => m.SalaryItemDetails) },
      { path: 'salaries/item-groups', title: 'المجموعات الرئيسية لبنود المرتبات', loadComponent: () => import('./features/salaries/salary-item-groups').then((m) => m.SalaryItemGroups) },
      { path: 'salaries/allocation', title: 'تخصيص بنود المرتبات للموظفين', loadComponent: () => import('./features/salaries/salary-allocation').then((m) => m.SalaryAllocation) },
      { path: 'salaries/allocation-categories', title: 'تخصيص بنود المرتب لفئات الموظفين', loadComponent: () => import('./features/salaries/allocation-by-category').then((m) => m.AllocationByCategory) },
      { path: 'salaries/allocation-disbursements', title: 'تخصيص بنود المرتب لأنواع الصرفيات', loadComponent: () => import('./features/salaries/allocation-by-disbursement').then((m) => m.AllocationByDisbursement) },
      { path: 'salaries/payroll', title: 'المرتب والبدلات', loadComponent: () => import('./features/salaries/salary-allowances').then((m) => m.SalaryAllowances) },
      { path: 'salaries/salary-slip', title: 'طباعة مفردات المرتب', loadComponent: () => import('./features/salaries/salary-slip-print').then((m) => m.SalarySlipPrint) },
      { path: 'salaries/installments', title: 'بيان الأقساط', loadComponent: () => import('./features/salaries/installments-statement').then((m) => m.InstallmentsStatement) },
      { path: 'salaries/incentives', title: 'كشوف حوافز', loadComponent: () => import('./features/salaries/incentives-search').then((m) => m.IncentivesSearch) },
      { path: 'salaries/incentives/:id', title: 'تفاصيل الصرفية', loadComponent: () => import('./features/salaries/incentive-details').then((m) => m.IncentiveDetails) },
      { path: 'salaries/non-staff', title: 'صرفيات غير العاملين', loadComponent: () => import('./features/salaries/non-staff-disbursements').then((m) => m.NonStaffDisbursements) },
      { path: 'salaries/non-staff/:id', title: 'تفاصيل الصرفية', loadComponent: () => import('./features/salaries/non-staff-details').then((m) => m.NonStaffDetails) },
      { path: 'salaries/calculate', title: 'حساب المرتبات والصرفيات', loadComponent: () => import('./features/salaries/payroll-calculation').then((m) => m.PayrollCalculation) },
      { path: 'salaries/fiscal', title: 'إجراءات السنة المالية', loadComponent: () => import('./features/salaries/fiscal-year-actions').then((m) => m.FiscalYearActions) },
      { path: 'salaries/periodic-raise', title: 'تحديد نسبة العلاوة الدورية', loadComponent: () => import('./features/salaries/periodic-raise-rates').then((m) => m.PeriodicRaiseRates) },

      // ── التقارير
      { path: 'reports', title: 'التقارير', loadComponent: () => import('./features/reports/reports').then((m) => m.Reports) },
      { path: 'reports/salary-slip', redirectTo: 'salaries/salary-slip' },
      { path: 'reports/incentives', redirectTo: 'salaries/incentives' },
      { path: 'reports/incentives-search', redirectTo: 'salaries/incentives' },
      { path: 'reports/installments', redirectTo: 'salaries/installments' },
      { path: 'reports/absence', redirectTo: 'attendance/absence' },
      { path: 'reports/salaries', title: 'تقارير المرتبات', data: { category: 'salaries', title: 'تقارير المرتبات' }, loadComponent: () => import('./features/reports/report-list').then((m) => m.ReportList) },
      { path: 'reports/disbursements', title: 'تقارير الصرفيات', data: { category: 'disbursements', title: 'تقارير الصرفيات' }, loadComponent: () => import('./features/reports/report-list').then((m) => m.ReportList) },
      { path: 'reports/hr', title: 'تقارير الموارد البشرية', data: { category: 'hr', title: 'تقارير الموارد البشرية' }, loadComponent: () => import('./features/reports/report-list').then((m) => m.ReportList) },
      stub('reports/attendance', 'تقارير الحضور والانصراف'),
      stub('reports/admin', 'تقارير إدارية'),
      stub('reports/tax', 'تقارير ضريبية'),
      stub('reports/pension', 'تقارير المعاشات'),
      stub('reports/custom', 'تقارير مخصصة'),

      // ── الإعدادات
      { path: 'settings', title: 'إعدادات المرتبات والحوافز', data: { group: 'salary', title: 'إعدادات المرتبات والحوافز' }, loadComponent: () => import('./features/settings/lookup-tabs.page').then((m) => m.LookupTabsPage) },
      { path: 'settings/hr-config', title: 'إعدادات الموارد البشرية', data: { group: 'hr', title: 'إعدادات الموارد البشرية' }, loadComponent: () => import('./features/settings/lookup-tabs.page').then((m) => m.LookupTabsPage) },
      { path: 'settings/system', title: 'إعدادات النظام', loadComponent: () => import('./features/settings/settings-hub').then((m) => m.SettingsHub) },
      { path: 'settings/disbursement-groups', title: 'مجموعات الصرفيات', loadComponent: () => import('./features/settings/settings-disbursement-groups').then((m) => m.SettingsDisbursementGroups) },
      { path: 'settings/periodic-allowance', title: 'نسبة العلاوة الدورية', loadComponent: () => import('./features/settings/settings-periodic-allowance').then((m) => m.SettingsPeriodicAllowance) },
      // Old standalone lookup screens now live as tabs
      { path: 'settings/banks', redirectTo: 'settings/hr-config?tab=banks' },
      { path: 'settings/cost-centers', redirectTo: 'settings/hr-config?tab=cost-centers' },
      { path: 'settings/departments', redirectTo: 'settings/hr-config?tab=departments' },
      stub('settings/users', 'مستخدمي النظام'),
      stub('settings/permissions', 'صلاحيات المستخدمين'),
      // Any other system-setting card from screen 23 without a design yet
      { path: 'settings/:slug', component: PlaceholderPage, data: { title: 'إعداد قيد التصميم' }, title: 'الإعدادات' },

      { path: 'forbidden', component: PlaceholderPage, data: { title: 'غير مسموح لك بفتح هذه الصفحة' }, title: 'غير مسموح' },
      { path: '**', component: PlaceholderPage, data: { title: 'الصفحة غير موجودة' } },
    ],
  },
];
