import { AppDatePipe, toIsoDate } from './date.pipe';

describe('AppDatePipe', () => {
  const pipe = new AppDatePipe();
  it('normalises API date formats to ISO', () => {
    expect(toIsoDate('2024-07-01')).toBe('2024-07-01');
    expect(toIsoDate('2024/7/1')).toBe('2024-07-01');
    expect(toIsoDate('01/07/2024')).toBe('2024-07-01');
    expect(toIsoDate('2024-07-01T10:00:00Z')).toBe('2024-07-01');
  });
  it('displays dd/MM/yyyy and a long Arabic form', () => {
    expect(pipe.transform('2024-07-01')).toBe('01/07/2024');
    expect(pipe.transform('1968-04-06', 'long')).toBe('06 أبريل 1968');
    expect(pipe.transform('')).toBe('—');
    expect(pipe.transform('غير محدد')).toBe('غير محدد');
  });
});
