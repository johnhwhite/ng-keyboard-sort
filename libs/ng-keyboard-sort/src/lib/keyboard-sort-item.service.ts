import { Injectable, signal } from '@angular/core';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';

/**
 * @internal
 */
@Injectable()
export class KeyboardSortItemService {
  public item = signal<KeyboardSortItemDirective | undefined>(undefined);
}
