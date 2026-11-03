/** The 32 system-setting entries from screen 23 (إعدادات النظام). `to` = real route; entries without a designed screen open a placeholder. */
export interface SettingEntry { n: number; title: string; desc: string; cat: string; to: string; query?: Record<string, string>; }
export const SETTING_CATEGORIES = ['المالية والرواتب', 'الهيكل التنظيمي', 'الوقت والحضور', 'المصروفات والصرفيات', 'الإجازات والعطلات', 'الدعم والتقارير', 'الأساسية الأخرى'];
const hr = (tab: string) => ({ to: '/settings/hr-config', query: { tab } });
const sal = (tab: string) => ({ to: '/settings', query: { tab } });
const ph = (slug: string) => ({ to: `/settings/${slug}` });
export const SETTINGS: SettingEntry[] = [
  { n: 1, title: 'حسابات', desc: 'إدارة حسابات النظام والحسابات البنكية', cat: 'المالية والرواتب', ...ph('accounts') },
  { n: 2, title: 'نسب علاوات خاصة', desc: 'إعداد نسب العلاوات الخاصة للموظفين', cat: 'المالية والرواتب', ...ph('special-allowances') },
  { n: 3, title: 'مراكز تكلف', desc: 'إدارة مراكز التكلفة المالية', cat: 'الهيكل التنظيمي', ...hr('cost-centers') },
  { n: 4, title: 'بنوك', desc: 'إدارة بيانات البنوك والحسابات البنكية', cat: 'المالية والرواتب', ...hr('banks') },
  { n: 5, title: 'شرائح دفعه نسبيه', desc: 'إعداد شرائح الدفع النسبية للرواتب', cat: 'المالية والرواتب', ...ph('payment-slabs') },
  { n: 6, title: 'ادارات', desc: 'إدارة الإدارات والأقسام', cat: 'الهيكل التنظيمي', ...hr('departments') },
  { n: 7, title: 'وظائف', desc: 'إدارة الوظائف والمسميات الوظيفية', cat: 'الهيكل التنظيمي', ...hr('jobs') },
  { n: 8, title: 'مجموعة وظيفيه', desc: 'إدارة المجموعات الوظيفية', cat: 'الهيكل التنظيمي', ...hr('job-groups') },
  { n: 9, title: 'علاوات', desc: 'إدارة أنواع العلاوات', cat: 'المالية والرواتب', ...ph('allowances') },
  { n: 10, title: 'جهات دائنه', desc: 'إدارة الجهات الدائنة والموردين', cat: 'المالية والرواتب', ...ph('creditors') },
  { n: 11, title: 'درجات', desc: 'إدارة درجات الوظائف', cat: 'الهيكل التنظيمي', ...hr('grades') },
  { n: 12, title: 'قروض', desc: 'إدارة القروض والمستحقات', cat: 'المالية والرواتب', ...ph('loans') },
  { n: 13, title: 'معاشات وضرائب 50', desc: 'إعداد بيانات المعاشات والضرائب بنسبة 50%', cat: 'المالية والرواتب', ...ph('insurance-tax') },
  { n: 14, title: 'دمغة توقيع', desc: 'إدارة دمغات التوقيع المعتمدة', cat: 'الدعم والتقارير', ...ph('stamp') },
  { n: 15, title: 'نسبة علاوة دورية', desc: 'إعداد نسب العلاوة الدورية', cat: 'المالية والرواتب', to: '/settings/periodic-allowance' },
  { n: 16, title: 'مجموعات صرفيات', desc: 'إدارة مجموعات الصرفيات', cat: 'المصروفات والصرفيات', to: '/settings/disbursement-groups' },
  { n: 17, title: 'اعفاءات الضرائب', desc: 'إعداد وإدارة اعفاءات الضرائب', cat: 'المالية والرواتب', ...ph('tax-exemptions') },
  { n: 18, title: 'مجموعات اقساط', desc: 'إدارة مجموعات الأقساط', cat: 'المالية والرواتب', ...sal('installment-groups') },
  { n: 19, title: 'قروض خارج مركز رئيسي', desc: 'إدارة القروض خارج المركز الرئيسي', cat: 'المالية والرواتب', ...ph('external-loans') },
  { n: 20, title: 'عطلات', desc: 'إدارة العطلات الرسمية والإجازات', cat: 'الإجازات والعطلات', ...sal('holidays') },
  { n: 21, title: 'صرفيات', desc: 'إدارة بيانات الصرفيات', cat: 'المصروفات والصرفيات', ...sal('disbursement-types') },
  { n: 22, title: 'خزائن', desc: 'إدارة خزائن النقد والأمانات', cat: 'المصروفات والصرفيات', ...ph('vaults') },
  { n: 23, title: 'تذاكر', desc: 'إدارة التذاكر والملاحظات', cat: 'المصروفات والصرفيات', ...sal('tickets') },
  { n: 24, title: 'الموقعين بالتقارير', desc: 'إدارة الموقعين المعتمدة بالتقارير', cat: 'الدعم والتقارير', ...ph('signatories') },
  { n: 25, title: 'انتماء ريف', desc: 'إدارة بيانات الانتماء الريفي للموظفين', cat: 'الأساسية الأخرى', ...ph('rural') },
  { n: 26, title: 'سلفة', desc: 'إدارة السلف والمدفوعات مقدماً', cat: 'المالية والرواتب', ...ph('advance') },
  { n: 27, title: 'اساسي جديد', desc: 'إدارة الأساسي الجديد للموظفين', cat: 'المالية والرواتب', ...ph('new-basic') },
  { n: 28, title: 'بدل انارة', desc: 'إعداد بدل الإنارة', cat: 'المالية والرواتب', ...ph('lighting') },
  { n: 29, title: 'حافز دوري', desc: 'إدارة الحوافز الدورية', cat: 'المالية والرواتب', ...ph('periodic-incentive') },
  { n: 30, title: 'فروق بدل نقدي', desc: 'إدارة فروق بدل نقدي للموظفين', cat: 'المالية والرواتب', ...ph('cash-diff') },
  { n: 32, title: 'قيمة وجبة غذائية', desc: 'إدارة قيمة الوجبة الغذائية', cat: 'الأساسية الأخرى', ...ph('meal-value') },
];
/** Tint per card (cycles like the design). */
export const CARD_TINTS = [
  { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-600' }, { bg: 'bg-edit', badge: 'bg-orange-100 text-brand' },
  { bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-600' }, { bg: 'bg-sky-50', badge: 'bg-sky-100 text-sky-600' },
  { bg: 'bg-edit', badge: 'bg-orange-100 text-brand' }, { bg: 'bg-green-50', badge: 'bg-green-100 text-green-600' },
  { bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-600' }, { bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-600' },
  { bg: 'bg-edit', badge: 'bg-orange-100 text-brand' }, { bg: 'bg-green-50', badge: 'bg-green-100 text-green-600' },
  { bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' }, { bg: 'bg-red-50', badge: 'bg-red-100 text-red-500' },
];
