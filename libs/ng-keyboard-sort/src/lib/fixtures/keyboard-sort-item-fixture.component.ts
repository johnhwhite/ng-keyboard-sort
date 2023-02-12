import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortHandleDirective } from '../keyboard-sort-handle.directive';
import { KeyboardSortItemDirective } from '../keyboard-sort-item.directive';
import { KeyboardSortService } from '../keyboard-sort.service';
import { KeyboardSortItemIfActiveDirective } from '../keyboard-sort-item-if-active.directive';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    KeyboardSortItemDirective,
    KeyboardSortHandleDirective,
    KeyboardSortItemIfActiveDirective,
  ],
  providers: [KeyboardSortService],
  template: `
    <div kbdSortItem [kbdSortItemDisabled]="disabled" #item>
      <div *ngIf="showHandle" kbdSortHandle class="example-handle">Handle</div>
      <span>Item 1</span>
      <span *kbdSortKeyboardSortItemIfActive class="example-active"
        >Active</span
      >
    </div>
  `,
})
export class KeyboardSortItemFixtureComponent {
  @ViewChild('item', { static: true, read: KeyboardSortItemDirective })
  public item: KeyboardSortItemDirective | undefined;

  public showHandle = false;

  public disabled = false;
}
