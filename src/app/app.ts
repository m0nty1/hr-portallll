import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from './shared/ui/confirm';
import { Toasts } from './shared/ui/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toasts, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet /><app-toasts /><app-confirm-dialog />`,
})
export class App {}
