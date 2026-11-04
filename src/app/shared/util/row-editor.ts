import { signal } from '@angular/core';

/**
 * Inline row editing for small tables (one row at a time): the row being edited turns light orange
 * and shows save/cancel; a new row is added at the top and dropped again on cancel.
 */
export class RowEditor<T extends object> {
  /** Index of the row being edited, or null. */
  readonly index = signal<number | null>(null);
  readonly isNew = signal(false);
  draft = {} as T;

  constructor(private readonly blank: () => T) {}

  edit(rows: T[], i: number) { this.draft = structuredClone(rows[i]); this.isNew.set(false); this.index.set(i); }
  /** Returns the rows with a blank row on top, already in edit mode. */
  add(rows: T[]): T[] { this.draft = this.blank(); this.isNew.set(true); this.index.set(0); return [structuredClone(this.draft), ...rows]; }
  /** Returns the rows to keep after cancelling (drops an unsaved new row). */
  cancel(rows: T[]): T[] {
    const out = this.isNew() ? rows.slice(1) : rows;
    this.index.set(null); this.isNew.set(false);
    return out;
  }
  /** Returns the rows with the draft written into the edited row. */
  commit(rows: T[]): T[] {
    const i = this.index();
    if (i === null) return rows;
    const out = rows.map((r, k) => (k === i ? structuredClone(this.draft) : r));
    this.index.set(null); this.isNew.set(false);
    return out;
  }
  editing() { return this.index() !== null; }
}
