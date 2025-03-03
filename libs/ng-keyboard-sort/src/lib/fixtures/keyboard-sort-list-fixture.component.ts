import {
  Component,
  computed,
  model,
  viewChild,
  viewChildren,
} from '@angular/core';
import { KeyboardSortItemDirective } from '../keyboard-sort-item.directive';
import { KeyboardSortListDirective } from '../keyboard-sort-list.directive';
import { KeyboardSortItemIfFocusedDirective } from '../keyboard-sort-item-if-focused.directive';
import { KeyboardSortItemIfActiveDirective } from '../keyboard-sort-item-if-active.directive';
import { KeyboardSortEventDrop } from '../keyboard-sort-event-drop';

@Component({
  imports: [
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortItemIfFocusedDirective,
    KeyboardSortItemIfActiveDirective,
  ],
  template: `
    <a href="#item-0">Start</a>
    <ul
      kbdSortList
      [(kbdSortListData)]="data"
      [kbdSortListOrientation]="direction()"
      [kbdSortListDisabled]="disabled()"
      (kdbSortDrop)="sortDrop($event)">
      @for (item of data() || []; track item; let i = $index) {
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
  public list = viewChild(KeyboardSortListDirective);

  public items = viewChildren(KeyboardSortItemDirective);

  public readonly currentFocus = computed<number>(() =>
    this.items().findIndex((item) => item.focused())
  );

  public readonly currentActive = computed<number>(() =>
    this.items().findIndex((item) => item.activated())
  );

  public data = model<string[] | undefined>(['Item 1', 'Item 2', 'Item 3']);

  public direction = model<'horizontal' | 'vertical'>('horizontal');

  public disabled = model<boolean>(false);

  public drops: KeyboardSortEventDrop[] = [];

  public sortDrop($event: KeyboardSortEventDrop) {
    this.drops.push($event);
  }

  public activateLastItem() {
    this.items().slice().pop()?.activate();
  }
}
