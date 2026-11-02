/** Minimal client-side exports. Replace with server-side export endpoints when available. */
export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename.endsWith('.csv') ? filename : filename + '.csv' });
  a.click();
  URL.revokeObjectURL(url);
}
export function printPage() { window.print(); }
