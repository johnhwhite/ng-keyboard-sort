import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortItemDirective } from '../keyboard-sort-item.directive';
import { KeyboardSortListDirective } from '../keyboard-sort-list.directive';
import { KeyboardSortItemIfFocusedDirective } from '../keyboard-sort-item-if-focused.directive';
import { KeyboardSortItemIfActiveDirective } from '../keyboard-sort-item-if-active.directive';
import { KeyboardSortEventDrop } from '../keyboard-sort-event-drop';

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
    <a href="#item-0">Start</a>
    <ul
      kbdSortList
      [kbdSortListData]="data || []"
      [kbdSortListOrientation]="direction"
      [kbdSortListDisabled]="disabled"
      (kdbSortDrop)="sortDrop($event)">
      @for (item of data || []; track item; let i = $index) {
        <li [kbdSortItem]="i" [attr.id]="'item-' + i">
          {{ item }}
          <span *kbdSortKeyboardSortItemIfActive>{{ ' ' }}Active</span>
          <span *kbdSortKeyboardSortItemIfFocused>{{ ' ' }}Focused</span>
        </li>
      }
    </ul>
    <div>
      <button (click)="activateLastItem()">Activate last item</button>
    </div>
  `,
})
export class KeyboardSortListFixtureComponent {
  @ViewChild(KeyboardSortListDirective)
  public list: KeyboardSortListDirective | undefined;

  @ViewChildren(KeyboardSortItemDirective)
  public items: QueryList<KeyboardSortItemDirective> | undefined;

  public data: string[] | undefined = ['Item 1', 'Item 2', 'Item 3'];

  public direction: 'horizontal' | 'vertical' = 'horizontal';

  public disabled = false;

  public drops: KeyboardSortEventDrop[] = [];

  public sortDrop($event: KeyboardSortEventDrop) {
    this.drops.push($event);
  }

  public activateLastItem() {
    this.items?.last?.activate();
  }
}
