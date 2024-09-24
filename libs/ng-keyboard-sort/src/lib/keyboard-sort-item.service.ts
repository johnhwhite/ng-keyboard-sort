import { Injectable } from '@angular/core';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';

/**
 * @internal
 */
@Injectable()
export class KeyboardSortItemService {
  public item: KeyboardSortItemDirective | undefined;
}
