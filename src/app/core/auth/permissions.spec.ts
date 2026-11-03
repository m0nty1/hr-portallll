import { permissionForUrl } from './permissions';

describe('permissionForUrl', () => {
  it('maps URL areas to permissions (longest prefix wins)', () => {
    expect(permissionForUrl('/')).toBeNull();
    expect(permissionForUrl('/employees/12')).toBe('hr.view');
    expect(permissionForUrl('/salaries/items')).toBe('salaries.view');
    expect(permissionForUrl('/salaries/calculate')).toBe('salaries.calculate');
    expect(permissionForUrl('/settings?tab=banks')).toBe('settings.manage');
    expect(permissionForUrl('/salariesx')).toBeNull();
  });
});
