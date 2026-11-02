/** Parse numbers that may use Arabic-Indic digits / separators ("١,٢٤٠٫٥" → 1240.5). */
export function num(v: string | number | null | undefined): number {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', '.').replace(/[^\d.-]/g, '');
  return +s || 0;
}
/** Format with Arabic-Indic digits and thousands separators. */
export const fmt = (n: number, digits = 0) => n.toLocaleString('ar-EG', { minimumFractionDigits: digits, maximumFractionDigits: digits });
