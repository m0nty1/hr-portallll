import { Injectable, inject } from '@angular/core';
import { ApiService, Page, Query, pageOf } from '../../core/api/api.service';
import { MOCK_ABSENCE, MOCK_PENALTIES } from './mock-data';
import { AbsenceRow, PenaltyRow } from './models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly api = inject(ApiService);
  /** GET /attendance/absences?department=&employee=&type=&from=&to=&page=&pageSize= */
  absences(q: Query) {
    return this.api.get<Page<AbsenceRow>>('/attendance/absences', q, () =>
      pageOf(MOCK_ABSENCE.filter((r) => (!q['type'] || r.type === q['type']) && (!q['employee'] || r.name === q['employee'])), +(q['page'] ?? 1), +(q['pageSize'] ?? 10)));
  }
  /** GET /attendance/penalties?... */
  penalties(q: Query) {
    return this.api.get<Page<PenaltyRow>>('/attendance/penalties', q, () =>
      pageOf(MOCK_PENALTIES.filter((r) => (!q['type'] || r.type === q['type']) && (!q['employee'] || r.name === q['employee'])), +(q['page'] ?? 1), +(q['pageSize'] ?? 10)));
  }
  /** POST /attendance/penalties (id<0 = new) */
  savePenalty(p: PenaltyRow) { return this.api.post('/attendance/penalties', p, p); }
  /** DELETE /attendance/penalties/:id */
  deletePenalty(id: number) { return this.api.delete(`/attendance/penalties/${id}`); }
}
