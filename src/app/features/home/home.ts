import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EmployeesService } from '../../shared/data/employees.service';
import { PageHeader } from '../../shared/ui/page-header';
import { Icon, IconName } from '../../shared/ui/icon';

interface QuickItem { label: string; to: string; color: string; icon: IconName; }

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  private readonly stats = toSignal(inject(EmployeesService).homeStats());

  protected readonly cards = () => {
    const s = this.stats();
    return [
      { label: 'إجمالي الموظفين', value: s?.employees, unit: 'موظف', bg: 'bg-blue-50', iconBg: 'bg-blue-100', color: 'text-blue-500', icon: 'users' as IconName },
      { label: 'الطلبات المعلقة', value: s?.pendingRequests, unit: 'طلب', bg: 'bg-edit', iconBg: 'bg-orange-100', color: 'text-brand', icon: 'clipboard' as IconName },
      { label: 'بدون ضريبة محسوبة', value: s?.noTax, unit: 'موظف', bg: 'bg-red-50', iconBg: 'bg-red-100', color: 'text-red-500', icon: 'alert' as IconName, alert: true },
      { label: 'بدون معاش محسوب', value: s?.noPension, unit: 'موظف', bg: 'bg-yellow-50', iconBg: 'bg-yellow-100', color: 'text-yellow-500', icon: 'alert-circle' as IconName, alert: true },
      { label: 'التقارير الشهرية', value: s?.monthlyReports, unit: 'تقرير', bg: 'bg-green-50', iconBg: 'bg-green-100', color: 'text-green-500', icon: 'chart' as IconName },
      { label: 'الإدارات النشطة', value: s?.activeDepartments, unit: 'إدارة', bg: 'bg-purple-50', iconBg: 'bg-purple-100', color: 'text-purple-500', icon: 'grid' as IconName },
    ];
  };

  protected readonly sections: { title: string; icon: IconName; items: QuickItem[] }[] = [
    { title: 'الموارد البشرية', icon: 'users', items: [
      { label: 'موظفين', to: '/employees', color: 'text-blue-500', icon: 'user' },
      { label: 'استعراض الموظفين', to: '/employees/browse', color: 'text-indigo-500', icon: 'eye' },
      { label: 'كشوف الغياب', to: '/attendance/absence', color: 'text-orange-500', icon: 'calendar' },
      { label: 'الجزاءات', to: '/attendance/penalties', color: 'text-red-500', icon: 'alert' },
      { label: 'تدرج العلاوات', to: '/salaries/periodic-raise', color: 'text-green-600', icon: 'activity' },
      { label: 'كشوف الترقيات', to: '/hr/promotions', color: 'text-purple-500', icon: 'arrow-up' },
    ] },
    { title: 'المرتبات والحوافز', icon: 'briefcase', items: [
      { label: 'بنود المرتبات', to: '/salaries/items', color: 'text-blue-600', icon: 'check-square' },
      { label: 'تخصيص البنود', to: '/salaries/allocation', color: 'text-indigo-500', icon: 'users' },
      { label: 'المرتب والبدلات', to: '/salaries/payroll', color: 'text-green-600', icon: 'briefcase' },
      { label: 'أقساط الموظفين', to: '/salaries/installments', color: 'text-teal-600', icon: 'card' },
      { label: 'كشوف حوافز', to: '/salaries/incentives', color: 'text-orange-500', icon: 'award' },
      { label: 'صرفيات غير العاملين', to: '/salaries/non-staff', color: 'text-purple-500', icon: 'folder' },
      { label: 'حساب المرتبات', to: '/salaries/calculate', color: 'text-blue-700', icon: 'calculator' },
      { label: 'إجراءات السنة المالية', to: '/salaries/fiscal', color: 'text-yellow-600', icon: 'calendar' },
    ] },
    { title: 'التقارير', icon: 'file-text', items: [
      { label: 'طباعة مفردات مرتب', to: '/salaries/salary-slip', color: 'text-blue-500', icon: 'print' },
      { label: 'تقارير المرتبات', to: '/reports/salaries', color: 'text-green-600', icon: 'file-text' },
      { label: 'تقارير الصرفيات', to: '/reports/disbursements', color: 'text-orange-500', icon: 'card' },
      { label: 'تقارير الموارد البشرية', to: '/reports/hr', color: 'text-purple-600', icon: 'users' },
    ] },
    { title: 'الإعدادات', icon: 'settings', items: [
      { label: 'إعدادات الموارد البشرية', to: '/settings/hr-config', color: 'text-blue-500', icon: 'users' },
      { label: 'إعدادات المرتبات', to: '/settings', color: 'text-green-600', icon: 'briefcase' },
      { label: 'مستخدمي النظام', to: '/settings/users', color: 'text-purple-500', icon: 'user' },
      { label: 'صلاحيات المستخدمين', to: '/settings/permissions', color: 'text-red-500', icon: 'lock' },
    ] },
  ];
}
