import { DestroyRef, inject, signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Page } from '../../core/api/api.service';

/**
 * Small state holder for paged tables: rows, total, page, pageSize, loading, error.
 * Usage (in a component field initializer):
 *   readonly list = new ListState<Row>((page, pageSize) => this.svc.search({ ...filters, page, pageSize }));
 *   list.load();       // initial / "بحث"
 *   (pageChange) → list.go(p)
 */
export class ListState<T> {
  readonly rows = signal<T[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly loading = signal(false);
  readonly error = signal(false);
  private sub?: Subscription;

  constructor(private readonly fetch: (page: number, pageSize: number) => Observable<Page<T>>) {
    inject(DestroyRef).onDestroy(() => this.sub?.unsubscribe());
  }

  /** Reload from page 1 (used by the search button). */
  search() { this.page.set(1); this.load(); }
  go(page: number) { this.page.set(page); this.load(); }
  resize(size: number) { this.pageSize.set(size); this.search(); }

  load() {
    this.sub?.unsubscribe();
    this.loading.set(true);
    this.error.set(false);
    this.sub = this.fetch(this.page(), this.pageSize()).subscribe({
      next: (p) => { this.rows.set(p.items); this.total.set(p.total); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set(true); },
    });
  }
}

/** Same idea for endpoints that return a plain array (no paging). */
export class LoadState<T> {
  readonly data = signal<T | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal(false);
  private sub?: Subscription;
  constructor(private readonly fetch: () => Observable<T>) {
    inject(DestroyRef).onDestroy(() => this.sub?.unsubscribe());
  }
  load() {
    this.sub?.unsubscribe();
    this.loading.set(true);
    this.error.set(false);
    this.sub = this.fetch().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set(true); },
    });
  }
}
