import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LookupsService } from '../../shared/data/lookups.service';
import { ItemAllocationTable } from './item-allocation-table';

/** Screen 15 – تخصيص بنود المرتب لفئات الموظفين (/salaries/allocation-categories). Filter: نوع التعيين. */
@Component({
  selector: 'app-allocation-by-category',
  imports: [ItemAllocationTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-item-allocation-table kind="categories" title="تخصيص بنود المرتب لفئات الموظفين" filterLabel="نوع التعيين" [options]="lk()?.appointTypes ?? []" />`,
})
export class AllocationByCategory { protected readonly lk = toSignal(inject(LookupsService).all$); }
