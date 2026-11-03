/** Parse numbers that may use Arabic-Indic digits / separators ("١,٢٤٠٫٥" → 1240.5). */
export function num(v: string | number | null | undefined): number {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/٫/g, '.').replace(/[,٬]/g, '');
  const m = s.match(/-?\d+(?:\.\d+)?/);
  return m ? +m[0] : 0;
}
/** Format with thousands separators (Latin digits – the portal standard). */
export const fmt = (n: number, digits = 0) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
