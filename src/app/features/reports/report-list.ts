import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../shared/ui/icon';
import { PageHeader } from '../../shared/ui/page-header';
import { ReportDef, ReportsService } from '../../shared/data/reports.service';

/** Mock catalogs (lists from the client, 06-11-2026). The real list comes from the DB: GET /reports/catalog?category=salaries|disbursements|hr */
const MOCK: Record<string, string[]> = {
  salaries: ['بيان الاستحقاقات', 'بيان الاستقطاعات', 'بيان أقساط الموظفين', 'إجمالي مرتبات مراكز تكلفة (استحقاقات)', 'إجمالي مرتبات مراكز تكلفة (استقطاعات)',
    'إجمالي مراكز تكلفة (مالي)', 'شريط مرتب موظف', 'وعاء ضريبة موظف', 'بطاقة الأجور المتغيرة للمعاشات', 'نموذج ضرائب موظف', 'كشوف توقيع (بنوك)',
    'كشف إجمالي المرتبات (مرايا)', 'مفردات مرتب موظف', 'نموذج معاشات المرتبات', 'نموذج تأمين مرضي للمرتبات'],
  disbursements: ['طباعة صرفية مع بيان الأساسي', 'طباعة مراكز تكلفة لصرفية', 'طباعة نموذج معاشات لصرفية', 'طباعة نموذج تأمين مرضي لصرفية',
    'بيان إجمالي الصرفيات خلال فترة', 'طباعة صرفيات موظف خلال فترة', 'طباعة صرفيات أعضاء مجلس الإدارة خلال فترة'],
  hr: ['بيان نسبة اشتراك التأمين الصحي الشامل', 'العلاوة الدورية المستحقة في شهر يوليو', 'بيان الإجازات خلال فترة', 'بيان بأسماء الموظفين والدرجة الوظيفية',
    'بيان بأسماء الموظفين والرقم التأميني', 'بيان بالترقيات الجديدة', 'بيان بالعلاوات التشجيعية', 'بيان بالموظفين حسب الحالة الوظيفية',
    'بيان بالموظفين حسب نوع التعيين', 'البيانات الخاصة بصندوق الانتماء'],
};

/** Screens 34a/34b/34c – dynamic report lists (/reports/salaries | disbursements | hr). Route data: { category, title }. */
@Component({
  selector: 'app-report-list',
  imports: [PageHeader, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="title()" [breadcrumb]="[{ label: 'التقارير', link: '/reports' }, { label: title() }]" />
    <main class="p-[13px]">
      <section class="card">
        <div class="p-[13px]">
          <label class="relative block">
            <app-icon name="search" [size]="16" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input class="input !pr-9" placeholder="ابحث باسم التقرير..." [ngModel]="q()" (ngModelChange)="q.set($event)" />
          </label>
        </div>
        <ul class="zebra-list">
          @for (r of view(); track r.id) {
            <li>
              <button type="button" class="w-full flex items-center gap-3 px-5 py-3 text-sm text-right hover:bg-orange-50/60 transition-colors" (click)="open(r)">
                <span class="w-7 h-7 rounded-md bg-orange-100 text-brand flex items-center justify-center shrink-0"><app-icon name="file" [size]="15" /></span>
                <span class="flex-1 text-gray-800">{{ r.name }}</span>
                <span class="icon-btn border-gray-200 text-gray-600"><app-icon name="chevron-left" [size]="14" /></span>
              </button>
            </li>
          } @empty {
            <li class="py-10 text-center text-sm text-gray-400">{{ loading() ? 'جاري التحميل...' : 'لا توجد تقارير مطابقة' }}</li>
          }
        </ul>
        <p class="px-5 py-3 text-xs text-gray-500">عدد التقارير: {{ view().length }}</p>
      </section>
    </main>
  `,
  styles: `.zebra-list li:nth-child(even) { background: #e6edf6; }`,
})
export class ReportList {
  readonly category = input<'salaries' | 'disbursements' | 'hr'>('salaries');
  readonly title = input('التقارير');
  private readonly reportsSvc = inject(ReportsService);
  protected readonly reports = signal<ReportDef[]>([]);
  protected readonly loading = signal(false);
  protected readonly q = signal('');
  protected readonly view = computed(() => this.reports().filter((r) => r.name.includes(this.q().trim())));

  constructor() {
    effect((onCleanup) => {
      const c = this.category();
      this.loading.set(true);
      const sub = this.reportsSvc.catalog(c, () => MOCK[c].map((name, i) => ({ id: `${c}-${i + 1}`, name })))
        .subscribe({ next: (r) => { this.reports.set(r); this.loading.set(false); }, error: () => this.loading.set(false) });
      onCleanup(() => sub.unsubscribe());
    });
  }
  /** Opens the report viewer: GET /reports/{id}/run (PDF). */
  open(r: ReportDef) { this.reportsSvc.open(`/reports/${r.id}/run`, r.name); }
}
