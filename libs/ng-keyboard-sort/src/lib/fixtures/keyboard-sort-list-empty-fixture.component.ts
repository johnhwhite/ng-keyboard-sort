import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortListDirective } from 'ng-keyboard-sort';

@Component({
  standalone: true,
  imports: [CommonModule, KeyboardSortListDirective],
  template: `<ul kbdSortList></ul>`,
})
export class KeyboardSortListEmptyFixtureComponent {
  @ViewChild(KeyboardSortListDirective)
  public list: KeyboardSortListDirective | undefined;
}
