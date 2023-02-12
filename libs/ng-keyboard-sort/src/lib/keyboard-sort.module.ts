import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';
import { KeyboardSortItemIfActiveDirective } from './keyboard-sort-item-if-active.directive';

@NgModule({
  imports: [
    CommonModule,
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortHandleDirective,
    KeyboardSortItemIfActiveDirective,
  ],
  exports: [
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortHandleDirective,
  ],
})
export class KeyboardSortModule {}
