import { Injectable } from '@angular/core';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';

/**
 * @internal
 */
@Injectable()
export class KeyboardSortListService<T extends unknown[]> {
  public list: KeyboardSortListDirective<T> | undefined;
}
