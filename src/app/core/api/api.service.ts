import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Query = Record<string, string | number | boolean | null | undefined>;

/** Paged list envelope the backend is expected to return for every list endpoint. */
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number; }

/**
 * Single entry point for HTTP. Every call passes its mock data as the last argument:
 * while environment.useMock is true the mock is returned (with a small delay so loading
 * states are visible); when it is false the real endpoint is called.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly mockDelay = 350;

  get<T>(url: string, query: Query | undefined, mock: T | (() => T)): Observable<T> {
    if (environment.useMock) return this.mock(mock);
    return this.http.get<T>(this.base + url, { params: this.params(query) });
  }
  post<T>(url: string, body: unknown, mock: T | (() => T)): Observable<T> {
    if (environment.useMock) return this.mock(mock);
    return this.http.post<T>(this.base + url, body);
  }
  put<T>(url: string, body: unknown, mock: T | (() => T)): Observable<T> {
    if (environment.useMock) return this.mock(mock);
    return this.http.put<T>(this.base + url, body);
  }
  delete<T = void>(url: string, mock?: T): Observable<T> {
    if (environment.useMock) return this.mock(mock as T);
    return this.http.delete<T>(this.base + url);
  }
  /** Downloads a file (Excel / PDF exports). */
  download(url: string, query?: Query): Observable<Blob> {
    if (environment.useMock) return this.mock(new Blob(['mock'], { type: 'text/plain' }));
    return this.http.get(this.base + url, { params: this.params(query), responseType: 'blob' });
  }

  private mock<T>(m: T | (() => T)): Observable<T> {
    const v = typeof m === 'function' ? (m as () => T)() : m;
    return of(structuredClone(v)).pipe(delay(this.mockDelay));
  }
  private params(q?: Query) {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(q ?? {})) if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    return p;
  }
}

/** Client-side paging helper used by mock data (the real API pages on the server). */
export function pageOf<T>(items: T[], page = 1, pageSize = 10): Page<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}
