import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService, Query } from '../../core/api/api.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../ui/toast';

export interface ReportDef { id: string; name: string; }

/** Opens server-generated reports (PDF). The backend returns the file as a blob. */
@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  /** GET /reports/catalog?category= */
  catalog(category: string, mock: () => ReportDef[]): Observable<ReportDef[]> { return this.api.get('/reports/catalog', { category }, mock); }

  /**
   * Opens a report in a new tab. The tab is opened synchronously (inside the click) so popup blockers allow it,
   * then filled when the file arrives. `url` e.g. `/reports/{id}/run`.
   */
  open(url: string, title: string, query?: Query) {
    const win = window.open('', '_blank');
    if (win) win.document.write(`<p dir="rtl" style="font-family:sans-serif;padding:24px">جاري تجهيز ${title}...</p>`);
    this.file(url, title, query).subscribe({
      next: (blob) => {
        const href = URL.createObjectURL(blob);
        if (win) win.location.href = href; else window.location.href = href;
        setTimeout(() => URL.revokeObjectURL(href), 60_000);
      },
      error: () => win?.close(),
    });
  }

  private file(url: string, title: string, query?: Query): Observable<Blob> {
    if (!environment.useMock) return this.api.download(url, query);
    // Demo: a placeholder page instead of the real PDF.
    const html = `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>${title}</title>
      <body style="font-family:Cairo,sans-serif;background:#d3ddea;padding:40px"><div style="background:#fff;border-top:4px solid #f47920;border-radius:16px;padding:32px;max-width:720px;margin:auto">
      <h1 style="color:#1e3461">${title}</h1><p>نسخة تجريبية — التقرير الفعلي (PDF) هيظهر هنا بعد ربط الـ API.</p>
      <p style="color:#888">${Object.entries(query ?? {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p></div></body></html>`;
    return this.api.get('/noop', undefined, () => 0).pipe(map(() => new Blob([html], { type: 'text/html' })));
  }
}
