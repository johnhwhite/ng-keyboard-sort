import { Injectable, signal } from '@angular/core';
import type { KeyboardSortListDirective } from './keyboard-sort-list.directive';

/**
 * The subset of KeyboardSortListDirective's public surface that item
 * directives need. Item and list directives each depend on this context
 * instead of injecting one another, so the (type-only) reference to
 * KeyboardSortListDirective here never becomes a runtime import cycle.
 *
 * @internal
 */
export type KeyboardSortListHandle = Pick<
  KeyboardSortListDirective<unknown[]>,
  | 'kbdSortListOrientation'
  | 'kbdSortListDisabled'
  | 'kbdSortKeyOverrides'
  | 'kbdSortListDescribedBy'
  | 'activeIndex'
  | 'hasPendingFocusRestore'
  | 'deactivateAll'
  | 'focusItem'
  | 'focusPreviousItem'
  | 'focusNextItem'
  | 'focusFirstItem'
  | 'focusLastItem'
  | 'moveItemUp'
  | 'moveItemDown'
  | 'moveItemToStart'
  | 'moveItemToEnd'
>;

/**
 * @internal
 */
@Injectable()
export class KeyboardSortListContext {
  public readonly list = signal<KeyboardSortListHandle | undefined>(undefined);
}
