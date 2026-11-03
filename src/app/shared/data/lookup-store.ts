import { Injectable, signal } from '@angular/core';
import { HR_TABS, SALARY_TABS } from './lookup-tables';

export type LookupRow = Record<string, string | boolean | number>;

/**
 * In-memory copy of the 21 settings tables, used only while `environment.useMock` is true,
 * so edits on the settings screens show up immediately in every dropdown of the demo.
 * With a real backend the same happens through GET /lookups after each save.
 */
@Injectable({ providedIn: 'root' })
export class MockLookupStore {
  private readonly tables = signal<Record<string, LookupRow[]>>(
    Object.fromEntries([...HR_TABS, ...SALARY_TABS].map((t) => [t.slug, structuredClone(t.rows)])),
  );
  rows(slug: string): LookupRow[] { return structuredClone(this.tables()[slug] ?? []); }
  set(slug: string, rows: LookupRow[]) { this.tables.update((t) => ({ ...t, [slug]: structuredClone(rows) })); }
  names(slug: string, field = 'name'): string[] { return (this.tables()[slug] ?? []).map((r) => String(r[field])).filter(Boolean); }
}
