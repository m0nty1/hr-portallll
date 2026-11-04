# API Contract (expected by the front-end)

Base: `environment.apiUrl` (default `/api`). JSON. **Dates: ISO `yyyy-mm-dd`** (the UI formats them as dd/MM/yyyy). **Numbers: plain JSON numbers or Latin-digit strings** (the UI shows Latin digits with thousands separators). Auth: `Authorization: Bearer <token>`. Paged lists return
`{ items: T[], total: number, page: number, pageSize: number }` and accept `page`, `pageSize`.
**Errors:** any non-2xx response may include `{ "message": "…" }` (Arabic, shown to the user as-is) and optionally `"fieldErrors": { field: message }`. 401 logs the user out.
Types are in `src/app/shared/data/models.ts`; sample payloads = `mock-data.ts`.

## Auth & lookups
| Method | URL | Notes |
|---|---|---|
| POST | /auth/login | `{username,password}` → `{token,user:{id,name,role,avatar,permissions[]}}`. Permission keys: `hr.view`, `hr.edit`, `salaries.view`, `salaries.edit`, `salaries.calculate`, `salaries.approve`, `reports.view`, `settings.manage` (see `core/auth/permissions.ts`). The UI hides menu items/buttons and blocks routes accordingly; **the backend must still enforce them on every endpoint**. |
| GET | /lookups | all dropdown lists (`Lookups`). Must be built from the same tables as `/settings/lookups/*` (banks, sectors, departments, grades, hiring-types, cost-centers…) so there is one source of truth. The UI re-fetches it after every settings save. |
| GET | /dashboard/stats | `HomeStats` (home cards) |

## Employees / HR
| GET | /employees | filters: sector, department, bank, grade, appointType, q … → Page<Employee> |
| PUT | /employees/batch | inline edits from 05 (`Employee[]`; all-or-nothing — see open questions) |
| GET / PUT | /employees/:code | `EmployeeProfile` (06a–06h) |
| GET / PUT | /employees/:code/salary-variables | `SalaryVariables` (06c/06g, 17) — saved together with the profile; the UI reports each result separately |
| GET | /employees/:id/salary-variables | `SalaryVariables` (06c, 17) |
| GET | /attendance/absences | department, employee, type, from, to → Page<AbsenceRow> |
| POST | /attendance/absences | create a leave (no id) → stored row with id and recalculated `balance` |
| PUT / DELETE | /attendance/absences/:id | update / delete a leave |
| GET | /attendance/leave-balances | LeaveBalanceRow[] (filters: department, employee, year) — annual / used / left per type (regular, casual, sick) |
| GET | /attendance/penalties | Page<PenaltyRow> (filters: department, employee, type, from, to) |
| POST | /attendance/penalties | create (no id in body) → returns the stored row with its id |
| PUT / DELETE | /attendance/penalties/:id | update / delete |
| GET / POST / PUT / DELETE | /hr/promotions[/:id] | `{id,name,grade,gradeDate,updated}` |
| POST | /hr/promotions/apply | "تحديث الترقيات" |

## Salaries
| GET | /salary-items | `?group=` → SalaryItem[] |
| POST | /salary-items | create → returns the item with its id |
| PUT / DELETE | /salary-items/:id | update / delete |
| GET / PUT | /salary-items/:code/dependencies | ItemDependency[] |
| GET / POST / PUT / DELETE | /salary-item-groups[/:code] | SalaryItemGroup[] |
| GET / PUT | /allocations/employee | `?employee=` → EmployeeItem[] |
| GET | /allocations/employees · /allocations/items | |
| GET / PUT | /allocations/{categories|disbursements} | `?key=` → string[] (item codes) |
| GET | /installments · /installments/types | Page<Installment> |
| GET | /incentives | Page<IncentiveSheet> |
| POST | /incentives | create a sheet → `{ id }` |
| GET / PUT | /incentives/:id | IncentiveSheetDetails |
| POST | /incentives/:id/actions/{load-current-basic|load-previous-basic|basic-salaries|refresh-employees} | |
| GET | /non-staff · /non-staff/:id · /non-staff/:id/employees | |
| POST | /payroll/calculate | body `{scope,target,disbursement,month,year}` → `PayrollSummary` **including `calculationId`** |
| POST | /payroll/calculations/:calculationId/approve | approves exactly that calculation (the UI never re-sends filters; changing a filter discards the result) |
| GET | /payroll/slip | `?employee=&month=&year=` (screen 18) |
| GET / POST | /fiscal-years/:year/periodic-raise[/count] | |
| GET / PUT / DELETE | /periodic-raise-rates[/:id] | `?year=` → EmployeeRate[] |

## Reports
| GET | /reports/catalog | `?category=salaries|disbursements|hr` → `{id,name}[]` (dynamic list, 34a–c) |
| GET | /reports/:id/run | report output — PDF as a blob (`Content-Type: application/pdf`); the UI opens it in a new tab |
| GET | /fiscal-years/:year/periodic-raise/report | PDF |
| GET | /payroll/slip | `?employee=&month=&year=` → slip JSON (screen 18) |

## Settings
| GET / POST / PUT / DELETE | /settings/lookups/{slug}[/:code] | 21 lookup tables (screens 31/32). Row = named fields per table (see `cols[].key` in `src/app/shared/data/lookup-tables.ts`, e.g. banks → `{code,name,swiftCode}`, grades → `{code,name,rankCode,scaleStart,…}`). Rows are identified by `code` (tickets use `id`). Dates are ISO `yyyy-mm-dd`, booleans for checkbox columns. Slugs: banks, branches, sectors, engineering, cost-centers, departments, job-groups, jobs, job-status, hiring-types, grades, qualifications, installment-groups, installment-accounts, installment-types, tax-groups, bank-groups, disbursement-types, financial-constants, tickets, holidays |
| GET | /settings/disbursement-groups · /settings/excel-groups · /settings/tax-groups | CodeName[] (27) |
| GET / POST | /settings/periodic-allowance[/refresh] | `?from=&to=` (28) |
