import { Injectable } from '@angular/core';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';

/**
 * @internal
 */
@Injectable()
export class KeyboardSortListService {
  public list: KeyboardSortListDirective | undefined;
}
