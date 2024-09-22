import { NgModule } from '@angular/core';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';

@NgModule({
  imports: [
    KeyboardSortHandleDirective,
    KeyboardSortItemDirective,
    KeyboardSortListDirective,
  ],
  exports: [
    KeyboardSortHandleDirective,
    KeyboardSortItemDirective,
    KeyboardSortListDirective,
  ],
})
export class KeyboardSortModule {}
