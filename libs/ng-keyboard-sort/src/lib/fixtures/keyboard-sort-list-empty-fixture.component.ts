import { Component, viewChild } from '@angular/core';
import { KeyboardSortListDirective } from '../keyboard-sort-list.directive';

@Component({
  imports: [KeyboardSortListDirective],
  template: `<ul kbdSortList></ul>`,
})
export class KeyboardSortListEmptyFixtureComponent {
  public list = viewChild(KeyboardSortListDirective);
}
