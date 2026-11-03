import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LookupsService } from '../../shared/data/lookups.service';
import { ItemAllocationTable } from './item-allocation-table';

/** Screen 16 – تخصيص بنود المرتب لأنواع الصرفيات (/salaries/allocation-disbursements). Filter: نوع الصرفية. */
@Component({
  selector: 'app-allocation-by-disbursement',
  imports: [ItemAllocationTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-item-allocation-table kind="disbursements" title="تخصيص بنود المرتب لأنواع الصرفيات" filterLabel="نوع الصرفية" [options]="lk()?.disbursementTypes ?? []" />`,
})
export class AllocationByDisbursement { protected readonly lk = toSignal(inject(LookupsService).all$); }
