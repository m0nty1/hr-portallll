import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from './icon';

export type Option = string | { value: string; label: string };
const val = (o: Option) => (typeof o === 'string' ? o : o.value);
const lbl = (o: Option) => (typeof o === 'string' ? o : o.label);

/** Labelled <select>. Empty value = the placeholder ("جميع ..."). */
@Component({
  selector: 'app-select-field',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1' },
  template: `
    @if (label()) { <label class="field-label" [attr.for]="id">{{ label() }}</label> }
    <div class="relative">
      <select [id]="id" class="input pl-8" [class.text-gray-400]="!value()" [class.bg-gray-100]="disabled()" [class.cursor-not-allowed]="disabled()"
        [disabled]="disabled()" [ngModel]="value()" (ngModelChange)="value.set($event)">
        @if (placeholder()) { <option value="">{{ placeholder() }}</option> }
        @for (o of options(); track $index) { <option [value]="v(o)" class="text-gray-800">{{ l(o) }}</option> }
      </select>
      <app-icon name="chevron-down" class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
    </div>
  `,
})
export class SelectField {
  private static n = 0;
  protected readonly id = `sel-${++SelectField.n}`;
  readonly label = input('');
  readonly placeholder = input('');
  readonly options = input<Option[]>([]);
  readonly disabled = input(false);
  readonly value = model('');
  protected v = val; protected l = lbl;
}

/** Labelled text input. kind: text | date | number | search. */
@Component({
  selector: 'app-text-field',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-1' },
  template: `
    @if (label()) { <label class="field-label" [attr.for]="id">{{ label() }}</label> }
    <div class="relative">
      <input [id]="id" [type]="kind() === 'date' ? 'date' : kind() === 'number' ? 'number' : 'text'" class="input"
        [class.pl-10]="kind() === 'search' || kind() === 'date'" [class.bg-gray-100]="readonly()"
        [readOnly]="readonly()" [placeholder]="placeholder()" [ngModel]="value()" (ngModelChange)="value.set($event)" />
      @if (kind() === 'search') {
        <app-icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      }
    </div>
  `,
})
export class TextField {
  private static n = 0;
  protected readonly id = `txt-${++TextField.n}`;
  readonly label = input('');
  readonly placeholder = input('');
  readonly kind = input<'text' | 'date' | 'number' | 'search'>('text');
  readonly readonly = input(false);
  readonly value = model('');
}
