import { CanDirective } from '../../core/auth/permissions';
import { AppDatePipe } from '../../shared/util/date.pipe';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LookupsService } from '../../shared/data/lookups.service';
import { EmployeeProfile as Profile, SalaryVariables } from '../../shared/data/models';
import { ToastService } from '../../shared/ui/toast';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { switchMap } from 'rxjs';
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
  save() {
    const d = this.draft()!;
    const sv = this.salaryDraft();
    if (sv) this.svc.saveSalaryVariables(this.id(), sv).subscribe();
    this.svc.saveProfile(this.id(), d).subscribe(() => { this.saved.set(d); this.savedSalary.set(this.salaryDraft()); this.editing.set(false); this.toast.success('تم حفظ التعديلات'); });
  }
}
