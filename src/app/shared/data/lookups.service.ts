import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, shareReplay, switchMap } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { MockLookupStore } from './lookup-store';
import { MOCK_EMPLOYEES, MOCK_LOOKUPS } from './mock-data';
import { Lookups } from './models';

/**
 * Dropdown options for every filter in the app. GET /lookups
 * The backend should build these lists from the same tables the settings screens edit
 * (banks, sectors, departments, grades, hiring types, cost centers…), so there is one source of truth.
 * Call refresh() after any settings save.
 */
@Injectable({ providedIn: 'root' })
export class LookupsService {
  private readonly api = inject(ApiService);
  private readonly store = inject(MockLookupStore);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  readonly all$ = this.refresh$.pipe(
    switchMap(() => this.api.get<Lookups>('/lookups', undefined, () => this.fromStore())),
    shareReplay(1),
  );
  refresh() { this.refresh$.next(); }

  private fromStore(): Lookups {
    const s = this.store;
    return {
      ...MOCK_LOOKUPS,
      sectors: s.names('sectors'),
      departments: s.names('departments'),
      banks: s.names('banks'),
      grades: s.names('grades'),
      appointTypes: s.names('hiring-types'),
      costCenters: s.names('cost-centers', 'code'),
      employees: MOCK_EMPLOYEES.map((e) => e.name),
      disbursementTypes: s.names('disbursement-types'),
      jobs: s.names('jobs'),
      engineering: s.names('engineering'),
      qualifications: s.names('qualifications'),
      qualificationTypes: [...new Set(s.rows('qualifications').map((r) => String(r['level'] ?? '')).filter(Boolean))],
      installmentTypes: s.names('installment-types'),
    };
  }
}
