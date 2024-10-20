import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortListDirective } from '../keyboard-sort-list.directive';

@Component({
  standalone: true,
  imports: [CommonModule, KeyboardSortListDirective],
  template: `<ul kbdSortList></ul>`,
})
export class KeyboardSortListEmptyFixtureComponent {
  @ViewChild(KeyboardSortListDirective)
  public list: KeyboardSortListDirective<string[]> | undefined;
}
