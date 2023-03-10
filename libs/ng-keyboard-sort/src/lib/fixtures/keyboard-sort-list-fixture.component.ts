import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortItemDirective } from '../keyboard-sort-item.directive';
import { KeyboardSortListDirective } from '../keyboard-sort-list.directive';
import { KeyboardSortItemIfFocusedDirective } from '../keyboard-sort-item-if-focused.directive';
import { KeyboardSortItemIfActiveDirective } from 'ng-keyboard-sort';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortItemIfFocusedDirective,
    KeyboardSortItemIfActiveDirective,
  ],
  template: `
    <ul
      kbdSortList
      [kbdSortListData]="data"
      [kbdSortListOrientation]="direction">
      <li
        *ngFor="let item of data; index as i"
        kbdSortItem
        [attr.id]="'item-' + i">
        {{ item }}
        <span *kbdSortKeyboardSortItemIfActive>{{ ' ' }}Active</span>
        <span *kbdSortKeyboardSortItemIfFocused>{{ ' ' }}Focused</span>
      </li>
    </ul>
  `,
})
export class KeyboardSortListFixtureComponent {
  @ViewChild(KeyboardSortListDirective)
  public list: KeyboardSortListDirective | undefined;

  @ViewChildren(KeyboardSortItemDirective)
  public items: QueryList<KeyboardSortItemDirective> | undefined;

  public data: string[] | undefined = ['Item 1', 'Item 2', 'Item 3'];

  public direction: 'horizontal' | 'vertical' = 'horizontal';
}
