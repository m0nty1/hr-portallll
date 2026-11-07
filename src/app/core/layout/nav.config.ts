import { IconName } from '../../shared/ui/icon';

export interface NavChild { label: string; to: string; }
export interface NavLink { type: 'link'; label: string; icon: IconName; to: string; }
export interface NavGroup { type: 'group'; id: string; label: string; icon: IconName; prefixes: string[]; children: NavChild[]; }
export type NavItem = NavLink | NavGroup;

/** Sidebar structure — mirrors the approved design. */
export const NAV: NavItem[] = [
  { type: 'link', label: 'الرئيسية', icon: 'home', to: '/' },
  {
    type: 'group', id: 'hr', label: 'الموارد البشرية', icon: 'users', prefixes: ['/employees', '/attendance', '/hr'],
    children: [
      { label: 'موظفين', to: '/employees' },
      { label: 'استعراض الموظفين', to: '/employees/browse' },
      { label: 'كشوف الغياب', to: '/attendance/absence' },
      { label: 'الجزاءات', to: '/attendance/penalties' },
      { label: 'كشوف الترقيات', to: '/hr/promotions' },
    ],
  },
  {
    type: 'group', id: 'salaries', label: 'المرتبات والحوافز', icon: 'briefcase', prefixes: ['/salaries'],
    children: [
      { label: 'المجموعات الرئيسية لبنود المرتبات', to: '/salaries/item-groups' },
      { label: 'بنود المرتبات', to: '/salaries/items' },
      { label: 'تخصيص بنود المرتب لفئات الموظفين', to: '/salaries/allocation-categories' },
      { label: 'تخصيص بنود المرتب لأنواع الصرفيات', to: '/salaries/allocation-disbursements' },
      { label: 'تخصيص بنود المرتب للموظفين', to: '/salaries/allocation' },
      { label: 'المرتب والبدلات', to: '/salaries/payroll' },
      { label: 'أقساط الموظفين', to: '/salaries/installments' },
      { label: 'كشوف حوافز', to: '/salaries/incentives' },
      { label: 'صرفيات غير العاملين', to: '/salaries/non-staff' },
      { label: 'حساب المرتبات والصرفيات', to: '/salaries/calculate' },
      { label: 'إجراءات السنة المالية', to: '/salaries/fiscal' },
      { label: 'تحديد نسبة العلاوة الدورية', to: '/salaries/periodic-raise' },
    ],
  },
  {
    type: 'group', id: 'reports', label: 'التقارير', icon: 'file-text', prefixes: ['/reports', '/salaries/salary-slip'],
    children: [
      { label: 'كل التقارير', to: '/reports' },
      { label: 'طباعة مفردات المرتب', to: '/salaries/salary-slip' },
      { label: 'تقارير المرتبات', to: '/reports/salaries' },
      { label: 'تقارير الصرفيات', to: '/reports/disbursements' },
      { label: 'تقارير الموارد البشرية', to: '/reports/hr' },
    ],
  },
  {
    type: 'group', id: 'settings', label: 'الإعدادات', icon: 'settings', prefixes: ['/settings'],
    children: [
      { label: 'إعدادات الموارد البشرية', to: '/settings/hr-config' },
      { label: 'إعدادات المرتبات والحوافز', to: '/settings' },
      { label: 'إعدادات النظام', to: '/settings/system' },
      { label: 'مستخدمو النظام', to: '/settings/users' },
      { label: 'إعادة تعيين كلمة المرور', to: '/settings/reset-password' },
    ],
  },
];
