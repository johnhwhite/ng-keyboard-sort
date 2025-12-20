import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KeyboardSortListDirective } from '../keyboard-sort-list.directive';

@Component({
  imports: [KeyboardSortListDirective],
  template: `<ul kbdSortList></ul>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardSortListEmptyFixtureComponent {
  public list = viewChild(KeyboardSortListDirective);
}
