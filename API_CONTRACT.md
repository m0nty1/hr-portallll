# API Contract (expected by the front-end)

Base: `environment.apiUrl` (default `/api`). JSON. Auth: `Authorization: Bearer <token>`. Paged lists return
`{ items: T[], total: number, page: number, pageSize: number }` and accept `page`, `pageSize`.
Types are in `src/app/shared/data/models.ts`; sample payloads = `mock-data.ts`.

## Auth & lookups
| Method | URL | Notes |
|---|---|---|
| POST | /auth/login | `{username,password}` → `{token,user:{id,name,role,avatar,permissions[]}}` |
| GET | /lookups | all dropdown lists (`Lookups`) – cached once |
| GET | /dashboard/stats | `HomeStats` (home cards) |

## Employees / HR
| GET | /employees | filters: sector, department, bank, grade, appointType, q … → Page<Employee> |
| PUT | /employees/batch | inline edits from 05 |
| GET / PUT | /employees/:id | `EmployeeProfile` (06a–06h) |
| GET | /employees/:id/salary-variables | `SalaryVariables` (06c, 17) |
| GET | /attendance/absences | department, employee, type, from, to → Page<AbsenceRow> |
| GET / POST / DELETE | /attendance/penalties[/:id] | Page<PenaltyRow> |
| GET / POST / PUT / DELETE | /hr/promotions[/:id] | `{id,name,grade,gradeDate,updated}` |
| POST | /hr/promotions/apply | "تحديث الترقيات" |

## Salaries
| GET / POST / PUT / DELETE | /salary-items[/:id] | `?group=` → SalaryItem[] |
| GET / PUT | /salary-items/:code/dependencies | ItemDependency[] |
| GET / POST / PUT / DELETE | /salary-item-groups[/:code] | SalaryItemGroup[] |
| GET / PUT | /allocations/employee | `?employee=` → EmployeeItem[] |
| GET | /allocations/employees · /allocations/items | |
| GET / PUT | /allocations/{categories|disbursements} | `?key=` → string[] (item codes) |
| GET | /installments · /installments/types | Page<Installment> |
| GET | /incentives | Page<IncentiveSheet> |
| GET / PUT | /incentives/:id | IncentiveSheetDetails (`new` = create) |
| POST | /incentives/:id/actions/{load-current-basic|load-previous-basic|basic-salaries|refresh-employees} | |
| GET | /non-staff · /non-staff/:id · /non-staff/:id/employees | |
| POST | /payroll/calculate · /payroll/approve | body `{scope,target,disbursement,month,year}` → PayrollSummary |
| GET | /payroll/slip | `?employee=&month=&year=` (screen 18) |
| GET / POST | /fiscal-years/:year/periodic-raise[/count] | |
| GET / PUT / DELETE | /periodic-raise-rates[/:id] | `?year=` → EmployeeRate[] |

## Reports
| GET | /reports/catalog | `?category=salaries|disbursements|hr` → `{id,name}[]` (dynamic list, 34a–c) |
| GET | /reports/:id/run | report output (PDF) |

## Settings
| GET / POST / PUT / DELETE | /settings/lookups/{slug}[/:code] | 21 lookup tables (screens 31/32). Row = `{c0,c1,…}` matching column order in `lookup-tabs.config.ts`; replace with named fields when the backend schema is fixed. Slugs: banks, branches, sectors, engineering, cost-centers, departments, job-groups, jobs, job-status, hiring-types, grades, qualifications, installment-groups, installment-accounts, installment-types, tax-groups, bank-groups, disbursement-types, financial-constants, tickets, holidays |
| GET | /settings/disbursement-groups · /settings/excel-groups · /settings/tax-groups | CodeName[] (27) |
| GET / POST | /settings/periodic-allowance[/refresh] | `?from=&to=` (28) |
