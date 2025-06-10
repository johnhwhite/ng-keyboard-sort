import { Component, model, viewChild } from '@angular/core';
import { KeyboardSortHandleDirective } from '../keyboard-sort-handle.directive';
import { KeyboardSortItemDirective } from '../keyboard-sort-item.directive';
import { KeyboardSortListService } from '../keyboard-sort-list.service';
import { KeyboardSortItemIfActiveDirective } from '../keyboard-sort-item-if-active.directive';
import { KeyboardSortItemIfFocusedDirective } from '../keyboard-sort-item-if-focused.directive';

@Component({
  imports: [
    KeyboardSortItemDirective,
    KeyboardSortHandleDirective,
    KeyboardSortItemIfActiveDirective,
    KeyboardSortItemIfFocusedDirective,
  ],
  providers: [KeyboardSortListService],
  template: `
    <div
      [kbdSortItem]="0"
      [kbdSortItemDisabled]="disabled()"
      [activated]="activated()"
      #item
      id="example-item">
      @if (showHandle()) {
        <div kbdSortHandle #handle class="example-handle">Handle</div>
      }
      <span>Item 1</span>
      <span *kbdSortKeyboardSortItemIfActive #active>Active</span>
      <span *kbdSortKeyboardSortItemIfFocused #focus>Focused</span>
    </div>
  `,
})
export class KeyboardSortItemFixtureComponent {
  public readonly item = viewChild('item', { read: KeyboardSortItemDirective });
  public readonly active = viewChild('active', {
    read: KeyboardSortItemIfActiveDirective,
  });
  public readonly focus = viewChild('focus', {
    read: KeyboardSortItemIfFocusedDirective,
  });
  public readonly activated = model<boolean>(false);
  public readonly showHandle = model<boolean>(false);
  public readonly disabled = model<boolean>(false);
}
