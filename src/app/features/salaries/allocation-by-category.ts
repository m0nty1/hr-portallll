import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ItemAllocationTable } from './item-allocation-table';

/** Screen 15 – تخصيص بنود المرتب لفئات الموظفين (/salaries/allocation-categories). Filter: نوع التعيين. */
@Component({
  selector: 'app-allocation-by-category',
  imports: [ItemAllocationTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-item-allocation-table kind="categories" title="تخصيص بنود المرتب لفئات الموظفين" filterLabel="نوع التعيين" [options]="['تعيين دائم', 'مكافأة شاملة', 'عقد']" />`,
})
export class AllocationByCategory {}
