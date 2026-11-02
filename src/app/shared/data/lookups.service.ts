import { Injectable, inject } from '@angular/core';
import { shareReplay } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { MOCK_LOOKUPS } from './mock-data';
import { Lookups } from './models';

/** Dropdown options for every filter in the app, loaded once and cached. GET /lookups */
@Injectable({ providedIn: 'root' })
export class LookupsService {
  private readonly api = inject(ApiService);
  readonly all$ = this.api.get<Lookups>('/lookups', undefined, MOCK_LOOKUPS).pipe(shareReplay(1));
}
