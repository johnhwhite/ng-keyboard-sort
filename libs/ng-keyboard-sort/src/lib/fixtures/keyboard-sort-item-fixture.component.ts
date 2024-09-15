import { Component, model, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortHandleDirective } from '../keyboard-sort-handle.directive';
import { KeyboardSortItemDirective } from '../keyboard-sort-item.directive';
import { KeyboardSortListService } from '../keyboard-sort-list.service';
import { KeyboardSortItemIfActiveDirective } from '../keyboard-sort-item-if-active.directive';
import { KeyboardSortItemIfFocusedDirective } from '../keyboard-sort-item-if-focused.directive';

@Component({
  standalone: true,
  imports: [
    CommonModule,
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
      <div *ngIf="showHandle" kbdSortHandle #handle class="example-handle">
        Handle
      </div>
      <span>Item 1</span>
      <span *kbdSortKeyboardSortItemIfActive #active>Active</span>
      <span *kbdSortKeyboardSortItemIfFocused #focus>Focused</span>
    </div>
  `,
})
export class KeyboardSortItemFixtureComponent {
  @ViewChild('item', { static: true, read: KeyboardSortItemDirective })
  public item: KeyboardSortItemDirective | undefined;

  @ViewChild('active', {
    read: KeyboardSortItemIfActiveDirective,
  })
  public active: KeyboardSortItemIfActiveDirective | undefined;

  @ViewChild('focus', {
    read: KeyboardSortItemIfFocusedDirective,
  })
  public focus: KeyboardSortItemIfFocusedDirective | undefined;

  public readonly activated = model<boolean>(false);
  public readonly showHandle = model<boolean>(false);
  public readonly disabled = model<boolean>(false);
}
