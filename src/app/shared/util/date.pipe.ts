import { Pipe, PipeTransform } from '@angular/core';

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/** Normalises any date the API may send ("2024-07-01", "2024/07/01", "01/07/2024", ISO datetime) to an ISO date "yyyy-mm-dd". */
export function toIsoDate(v: string | null | undefined): string {
  const s = String(v ?? '').trim();
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
}

/**
 * Portal-wide date display: dd/MM/yyyy (Latin digits). `long` → "06 أبريل 1968".
 * The API should send ISO dates (yyyy-mm-dd); anything unparseable is shown as-is, empty → "—".
 */
@Pipe({ name: 'appDate' })
export class AppDatePipe implements PipeTransform {
  transform(v: string | null | undefined, style: 'short' | 'long' = 'short'): string {
    if (!v || v === '—') return '—';
    const iso = toIsoDate(v);
    if (!iso) return String(v);
    const [y, mo, d] = iso.split('-');
    return style === 'long' ? `${d} ${AR_MONTHS[+mo - 1]} ${y}` : `${d}/${mo}/${y}`;
  }
}
