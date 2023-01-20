import { Component } from '@angular/core';
import { KeyboardSortHandleDirective } from '../keyboard-sort-handle.directive';

@Component({
  standalone: true,
  imports: [KeyboardSortHandleDirective],
  template: ` <div kbdSortHandle>Handle</div> `,
})
export class KeyboardSortHandleFixtureComponent {}
