import { Component, ViewChild } from '@angular/core';
import { KeyboardSortListDirective } from '../keyboard-sort-list.directive';

@Component({
  imports: [KeyboardSortListDirective],
  template: `<ul kbdSortList></ul>`,
})
export class KeyboardSortListEmptyFixtureComponent {
  @ViewChild(KeyboardSortListDirective)
  public list: KeyboardSortListDirective<string[]> | undefined;
}
