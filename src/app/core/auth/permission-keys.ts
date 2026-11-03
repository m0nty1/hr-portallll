/**
 * Permission keys the backend returns in `user.permissions` (login response).
 * The UI shows/allows only what is listed; an empty list means no access.
 */
export const PERMISSIONS = {
  hrView: 'hr.view',                   // الموظفين، الغياب، الجزاءات، الترقيات (عرض)
  hrEdit: 'hr.edit',                   // تعديل بيانات الموظفين والجزاءات والترقيات
  salariesView: 'salaries.view',       // شاشات المرتبات والحوافز (عرض)
  salariesEdit: 'salaries.edit',       // بنود، تخصيص، كشوف، أقساط
  salariesCalculate: 'salaries.calculate',
  salariesApprove: 'salaries.approve', // اعتماد الصرف + منح العلاوة الدورية
  reportsView: 'reports.view',
  settingsManage: 'settings.manage',
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);
