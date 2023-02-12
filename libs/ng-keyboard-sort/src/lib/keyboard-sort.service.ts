import { Injectable } from '@angular/core';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';

@Injectable()
export class KeyboardSortService {
  public list: KeyboardSortListDirective | undefined;
}
