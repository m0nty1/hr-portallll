import { CanDirective } from '../../core/auth/permissions';
import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../shared/data/lookups.service';
import { EmployeeProfile as Profile, SalaryVariables } from '../../shared/data/models';
import { ToastService } from '../../shared/ui/toast';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { EmployeesService } from '../../shared/data/employees.service';
import { Icon, IconName } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { SalaryVariablesCard } from './salary-variables-card';

type Tab = 'personal' | 'job' | 'salary' | 'raises';

@Component({
  selector: 'app-employee-profile',
  imports: [AppDatePipe, PageHeader, Icon, SalaryVariablesCard, NgTemplateOutlet, FormsModule, CanDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-profile.html',
})
export class EmployeeProfile {
  private readonly svc = inject(EmployeesService);
  /** Route param :id (bound via withComponentInputBinding). */
  readonly id = input.required<string>();
  protected readonly profile = toSignal(toObservable(this.id).pipe(switchMap((id) => this.svc.profile(id))));
  protected readonly salary = toSignal(toObservable(this.id).pipe(switchMap((id) => this.svc.salaryVariables(id))));
  protected readonly tab = signal<Tab>('personal');
  protected readonly tabs: { key: Tab; label: string; icon: IconName }[] = [
    { key: 'personal', label: 'بيانات شخصية', icon: 'user' },
    { key: 'job', label: 'بيانات وظيفية', icon: 'briefcase' },
    { key: 'salary', label: 'المرتب والبدلات', icon: 'wallet' },
    { key: 'raises', label: 'تدرج العلاوات', icon: 'trend' },
  ];
  protected readonly dateKeys = new Set(['تاريخ الدرجة', 'تاريخ التعيين', 'تاريخ الميلاد', 'تاريخ انهاء الخدمة', 'تاريخ الحصول عليه', 'تاريخ التجنيد']);
  protected entries(o: Record<string, string>) { return Object.entries(o); }

  // ── Edit mode (frames 06e–06h): same layout, fields become inputs/selects.
  private readonly toast = inject(ToastService);
  private readonly lk = toSignal(inject(LookupsService).all$);
  protected readonly editing = signal(false);
  private readonly draft = signal<Profile | null>(null);
  private readonly saved = signal<Profile | null>(null);
  protected readonly view = computed(() => (this.editing() ? this.draft() : this.saved() ?? this.profile()));
  protected optionsFor(key: string): string[] | null {
    const l = this.lk();
    const map: Record<string, string[] | undefined> = {
      'القطاع': l?.sectors, 'الادارة': l?.departments, 'الإدارة': l?.departments, 'الدرجة الوظيفية': l?.grades, 'نوع التعيين': l?.appointTypes,
      'الحالة الوظيفية': l?.jobStatuses, 'مركز التكلفة': l?.costCenters, 'الحالة الاجتماعية': ['أعزب', 'متزوج', 'مطلق', 'أرمل'],
      'الديانة': ['مسلم', 'مسيحي'], 'النوع': ['ذكر', 'أنثى'], 'سبب انهاء الخدمة': ['معاش', 'استقالة', 'وفاة', 'نقل'],
    };
    return map[key] ?? null;
  }
  protected readonly salaryDraft = signal<SalaryVariables | undefined>(undefined);
  protected readonly savedSalary = signal<SalaryVariables | undefined>(undefined);
  startEdit() {
    this.draft.set(structuredClone(this.view()!));
    this.salaryDraft.set(structuredClone(this.savedSalary() ?? this.salary()));
    this.editing.set(true);
  }
  cancel() { this.editing.set(false); }
  protected readonly saving = signal(false);

  /**
   * Saves the profile and the salary variables together. Each request reports its own outcome so a
   * partial failure is never shown as success; the part that failed stays in edit mode to retry.
   */
  save() {
    if (this.saving()) return;
    const id = this.id();
    const d = structuredClone(this.draft()!);
    const sv = this.salaryDraft() ? structuredClone(this.salaryDraft()!) : undefined;
    const ok = <T>(o: Observable<T>) => o.pipe(map(() => true), catchError(() => of(false)));
    this.saving.set(true);
    forkJoin({ profile: ok(this.svc.saveProfile(id, d)), salary: sv ? ok(this.svc.saveSalaryVariables(id, sv)) : of(true) }).subscribe((r) => {
      this.saving.set(false);
      if (this.id() !== id) return; // user already moved to another employee
      if (r.profile) this.saved.set(d);
      if (r.salary && sv) this.savedSalary.set(sv);
      if (r.profile && r.salary) { this.editing.set(false); this.toast.success('تم حفظ التعديلات'); }
      else if (r.profile) this.toast.error('اتحفظت البيانات الأساسية، لكن فشل حفظ متغيرات المرتب — راجعها وحاول تاني');
      else if (r.salary) this.toast.error('اتحفظت متغيرات المرتب، لكن فشل حفظ بيانات الموظف — حاول تاني');
      else this.toast.error('لم يتم حفظ أي تعديلات، حاول مرة أخرى');
    });
  }

  constructor() {
    // Opening another employee discards any edit state that belonged to the previous one.
    effect(() => {
      this.id();
      untracked(() => {
        this.editing.set(false); this.draft.set(null); this.saved.set(null);
        this.salaryDraft.set(undefined); this.savedSalary.set(undefined); this.tab.set('personal');
      });
    });
  }
}
