import { Component } from '@angular/core';
import { KeyboardSortHandleDirective } from 'ng-keyboard-sort';

@Component({
  standalone: true,
  imports: [KeyboardSortHandleDirective],
  template: ` <div kbdSortHandle>Handle</div> `,
})
export class KeyboardSortHandleFixtureComponent {}
