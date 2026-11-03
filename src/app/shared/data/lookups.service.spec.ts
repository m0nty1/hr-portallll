import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { filter, firstValueFrom } from 'rxjs';
import { MockLookupStore } from './lookup-store';
import { LookupsService } from './lookups.service';

describe('LookupsService (mock mode)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient()] }));

  it('builds dropdowns from the settings tables and refreshes after edits', async () => {
    const svc = TestBed.inject(LookupsService);
    const store = TestBed.inject(MockLookupStore);
    const before = await firstValueFrom(svc.all$);
    expect(before.banks).toContain('بنك مصر');

    store.set('banks', [...store.rows('banks'), { code: '099', name: 'بنك تجريبي', swiftCode: 'TEST' }]);
    svc.refresh();
    const after = await firstValueFrom(svc.all$.pipe(filter((l) => l.banks.includes('بنك تجريبي'))));
    expect(after.banks.length).toBe(before.banks.length + 1);
  });
});
