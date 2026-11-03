import { toCsv } from './export';

describe('toCsv', () => {
  it('neutralises spreadsheet formulas but keeps negative numbers', () => {
    const text = toCsv(['a', 'b', 'c'], [['=HYPERLINK("x")', '-15', '@cmd']]);
    expect(text).toContain(`"'=HYPERLINK(""x"")"`);
    expect(text).toContain('"-15"');
    expect(text).toContain(`"'@cmd"`);
  });
});
