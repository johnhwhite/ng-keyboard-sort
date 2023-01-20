import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  KeyboardSortHandleDirective,
  KeyboardSortItemDirective,
} from 'ng-keyboard-sort';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    KeyboardSortItemDirective,
    KeyboardSortHandleDirective,
  ],
  template: `
    <div kbdSortItem [kbdSortItemDisabled]="disabled" #item>
      <div *ngIf="showHandle" kbdSortHandle class="example-handle">Handle</div>
      <span>Item 1</span>
    </div>
  `,
})
export class KeyboardSortItemFixtureComponent {
  @ViewChild('item', { static: true, read: KeyboardSortItemDirective })
  public item: KeyboardSortItemDirective | undefined;

  public showHandle = false;

  public disabled = false;
}
