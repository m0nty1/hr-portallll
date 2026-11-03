/** Minimal client-side exports. Replace with server-side export endpoints when available. */
/** Builds the CSV text (UTF-8 BOM so Excel shows Arabic correctly). */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  // Prevent spreadsheet formula injection: text starting with = + - @ (or tab/CR) is prefixed with '
  const safe = (v: string | number) => {
    const s = String(v ?? '');
    return typeof v === 'string' && /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;
  };
  const esc = (v: string | number) => `"${safe(v).replace(/"/g, '""')}"`;
  return '\ufeff' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
}

export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = toCsv(headers, rows);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename.endsWith('.csv') ? filename : filename + '.csv' });
  a.click();
  URL.revokeObjectURL(url);
}
export function printPage() { window.print(); }
