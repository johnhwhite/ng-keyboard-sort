import { NgModule } from '@angular/core';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';

/**
 * @deprecated All of this library's directives are standalone. Import
 * `KeyboardSortListDirective`, `KeyboardSortItemDirective`, and
 * `KeyboardSortHandleDirective` directly instead. Will be removed in the
 * next major version.
 */
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
