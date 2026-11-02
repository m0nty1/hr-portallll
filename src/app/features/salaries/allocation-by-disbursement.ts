import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemAllocationTable } from './item-allocation-table';

/** Screen 16 – تخصيص بنود المرتب لأنواع الصرفيات (/salaries/allocation-disbursements). Filter: نوع الصرفية. */
@Component({
  selector: 'app-allocation-by-disbursement',
  imports: [ItemAllocationTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-item-allocation-table kind="disbursements" title="تخصيص بنود المرتب لأنواع الصرفيات" filterLabel="نوع الصرفية" [options]="['مرتب شهري', 'مكافأة', 'حافز', 'بدل سفر', 'تسوية']" />`,
})
export class AllocationByDisbursement {}
