import { Injectable } from '@angular/core';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';

@Injectable()
export class KeyboardSortItemService {
  public item: KeyboardSortItemDirective | undefined;
}
