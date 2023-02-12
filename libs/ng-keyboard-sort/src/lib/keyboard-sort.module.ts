import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';
import { KeyboardSortItemIfActiveDirective } from './keyboard-sort-item-if-active.directive';
import { KeyboardSortItemIfFocusedDirective } from './keyboard-sort-item-if-focused.directive';

@NgModule({
  imports: [
    CommonModule,
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortHandleDirective,
    KeyboardSortItemIfActiveDirective,
    KeyboardSortItemIfFocusedDirective,
  ],
  exports: [
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortHandleDirective,
  ],
})
export class KeyboardSortModule {}
