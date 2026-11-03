# برنامج الاستحقاقات – HR Portal (Angular)

واجهة نظام الموارد البشرية والمرتبات لشركة مصر العليا لتوزيع الكهرباء — مبنية من تصميم Figma **HR Portal**
(`figma.com/design/evSWrR1ojsv0h2X7aRSut9`). عربي RTL بالكامل.

## التشغيل
```bash
npm install
npx ng serve          # http://localhost:4200  (أي اسم مستخدم/باسورد في وضع الـ mock = مدير ديمو بكل الصلاحيات)
npx ng build          # production → dist/hr-portal/browser
```
Node 22.12+ و Angular 21 (standalone + signals + zoneless) و Tailwind v4 و lucide-angular.

## الربط بالـ Backend
- `environment.ts` (تطوير) و `environment.demo.ts` (الديمو): `useMock: true`.
- `environment.prod.ts` (النسخة الحقيقية): `useMock: false` وبتكلّم الـ API على `apiUrl`.
- طول ما `useMock: true` كل طلب بيرجع بيانات وهمية من `shared/data/mock-data.ts` (بتأخير 350ms).
- لما الـ APIs تجهز: `useMock: false` و `apiUrl` على السيرفر — مفيش أي تغيير تاني في الشاشات.
- كل الـ endpoints المتوقعة موثقة في **API_CONTRACT.md** وفي تعليقات الـ services (`src/app/shared/data/*.service.ts`).
- التوكن بيتبعت `Authorization: Bearer …` تلقائي، و401 بيعمل logout.

## خريطة الشاشات ↔ فريمات Figma
| Route | الشاشة | Frame |
|---|---|---|
| `/` | الرئيسية | 01 |
| `/employees` | البحث عن موظف (+ فلاتر متقدمة) | 02 / 02b |
| `/attendance/absence` | كشف الغياب والإجازات | 03 |
| `/attendance/penalties` | الجزاءات والعقوبات | 04 |
| `/employees/browse` | استعراض الموظفين (تعديل inline) | 05 |
| `/employees/:id` | ملف الموظف – 4 تابات + وضع التعديل (كل التابات) | 06a–06h |
| `/hr/promotions` | كشوف الترقيات | 33 |
| `/reports` | التقارير | 07 |
| `/salaries/incentives` | بحث عن كشف صرفية حافز | 08 |
| `/salaries/incentives/:id` · `/salaries/incentives/new` | تفاصيل الصرفية · كشف جديد | 09 / 09b |
| `/salaries/installments` | بيان الأقساط | 10 |
| `/salaries/items` | بنود المرتبات | 11 |
| `/salaries/item-groups` | المجموعات الرئيسية لبنود المرتبات | 12 |
| `/salaries/items/:code` | تفاصيل بند المرتب | 13 |
| `/salaries/allocation` | تخصيص البنود للموظفين | 14 |
| `/salaries/allocation-categories` | تخصيص البنود لفئات الموظفين | 15 |
| `/salaries/allocation-disbursements` | تخصيص البنود لأنواع الصرفيات | 16 |
| `/salaries/payroll` | المرتب والبدلات | 17 |
| `/salaries/salary-slip` | طباعة مفردات المرتب | 18 |
| `/salaries/non-staff` · `/:id` | صرفيات غير العاملين · التفاصيل | 19a / 19b |
| `/salaries/calculate` | حساب المرتبات والصرفيات | 20 |
| `/salaries/fiscal` | إجراءات السنة المالية | 21 |
| `/salaries/periodic-raise` | تحديد نسبة العلاوة الدورية | 22 |
| `/reports/salaries` · `/disbursements` · `/hr` | قوائم التقارير (ديناميك من الـ DB) | 34a–c |
| `/settings/system` | إعدادات النظام (32 كارت) | 23 |
| `/settings/disbursement-groups` | مجموعات الصرفيات والضرائب والاكسل | 27 |
| `/settings/periodic-allowance` | نسبة العلاوة الدورية | 28 |
| `/settings/hr-config?tab=…` | إعدادات الموارد البشرية – 12 تاب | 31.01–31.12 |
| `/settings?tab=…` | إعدادات المرتبات والحوافز – 9 تابات | 32.01–32.09 |

تابات 31/32 كلها شغالة بكومبوننت واحد (`features/settings/lookup-tabs.page.ts`) والأعمدة متعرفة في
`shared/data/lookup-tables.ts` (متولّد من الفريمات) — إضافة تاب جديد = إضافة object.

**Placeholders** (لسه مالهاش تصميم): `/settings/users`, `/settings/permissions`, `/reports/custom|attendance|admin|tax|pension`,
وأي كارت في شاشة 23 مالوش شاشة → `/settings/<slug>` بيفتح صفحة "قيد التصميم". لما التصميم يوصل: استبدل `stub(...)` في `app.routes.ts`.

## الهيكل
```
src/app/
  core/      auth (login, guard, interceptor) · api (ApiService + mock switch) · layout (shell, sidebar 68px, nav)
  shared/    ui (page-header, pagination, table-state, fields, icon, toast, placeholder) · data (models, mocks, services) · util
  features/  home · employees · attendance · hr · salaries · reports · settings
```
Design tokens في `src/styles.css`: navy `#1e3461`، برتقالي `#f47920`، خلفية `#d3ddea`، حدود الكروت `#c3cede` + خط برتقالي 4px فوق، صف التعديل `#ffe0bd`.

## الحالات (States)
S1 فلاتر متقدمة · S2 تعديل خلية + رسالة حفظ (toast) · S3 بحث الموظف بقايمة كود+اسم و"اختر موظف" · S4 تأكيد منح العلاوة · S5/S6/S7 صف إضافة/تعديل inline · S8 السايدبار بيتفتح بالـ hover. كمان كل جدول فيه حالة تحميل/خطأ/فاضي.

## معايير ثابتة في المشروع
- **الأرقام:** إنجليزي بفواصل الآلاف (3,250). `shared/util/num.ts` (`num()` / `fmt()`).
- **التواريخ:** الـ API يبعت ISO `yyyy-mm-dd`، والعرض `dd/MM/yyyy` عن طريق `| appDate` (`shared/util/date.pipe.ts`).
- **تأكيد الحذف/الاعتماد:** `ConfirmService.ask()` بدل `window.confirm` (`shared/ui/confirm.ts`).
- **القوايم المنسدلة:** مصدرها واحد، جداول الإعدادات (31/32) عن طريق `GET /lookups`، وبتتحدّث بعد أي حفظ في الإعدادات.
- **الصلاحيات:** `core/auth/permissions.ts`. السايدبار بيخفي اللي مش مسموح، والـ routes محمية بـ guard، والأزرار الحساسة بـ `*appCan`. (الـ backend لازم يتحقق برضه.)

## الاختبارات
```bash
npx ng test --watch=false
```
