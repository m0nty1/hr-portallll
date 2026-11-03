import { fmt, num } from './num';

describe('num / fmt', () => {
  it('parses Latin and Arabic-Indic digits', () => {
    expect(num('3,250')).toBe(3250);
    expect(num('١٬٢٤٠٫٥')).toBe(1240.5);
    expect(num('42,800.00 ج.م')).toBe(42800);
    expect(num('')).toBe(0);
  });
  it('formats with Latin digits and separators', () => {
    expect(fmt(1240)).toBe('1,240');
    expect(fmt(22817.07, 2)).toBe('22,817.07');
  });
});
