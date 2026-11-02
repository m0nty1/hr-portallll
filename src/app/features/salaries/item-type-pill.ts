import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ItemType } from '../../shared/data/models';

const C: Record<ItemType, string> = { 'استحقاق': 'bg-green-50 text-green-600', 'استقطاع': 'bg-red-50 text-red-500', 'أخرى': 'bg-white text-gray-600 border border-gray-300' };

@Component({
  selector: 'app-item-type-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="pill" [class]="c[type()]">{{ type() }}</span>`,
})
export class ItemTypePill { readonly type = input.required<ItemType>(); protected c = C; }
