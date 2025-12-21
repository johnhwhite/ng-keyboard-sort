import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KeyboardSortHandleDirective } from '../keyboard-sort-handle.directive';

@Component({
  imports: [KeyboardSortHandleDirective],
  template: ` <div kbdSortHandle>Handle</div> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardSortHandleFixtureComponent {}
