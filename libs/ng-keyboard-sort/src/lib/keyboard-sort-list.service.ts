import { Injectable, signal } from '@angular/core';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';

/**
 * @internal
 */
@Injectable()
export class KeyboardSortListService<T extends unknown[]> {
  public readonly list = signal<KeyboardSortListDirective<T> | undefined>(
    undefined
  );
}
