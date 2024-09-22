import { inject, Injectable } from '@angular/core';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortListService } from './keyboard-sort-list.service';

const directionalKeys = {
  up: ['ArrowUp', 'W', 'w'],
  down: ['ArrowDown', 'S', 's'],
  left: ['ArrowLeft', 'A', 'a'],
  right: ['ArrowRight', 'D', 'd'],
};

/**
 * @internal
 */
@Injectable()
export class KeyboardSortItemService {
  public item: KeyboardSortItemDirective | undefined;

  readonly #list = inject(KeyboardSortListService).list;

  public onKeydown(event: KeyboardEvent): void {
    if (!this.item || this.item.isDisabled()) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      this.item.toggleActivated();
      return;
    }
    if (
      [
        ...directionalKeys.up,
        ...directionalKeys.down,
        ...directionalKeys.left,
        ...directionalKeys.right,
      ].includes(event.key)
    ) {
      event.preventDefault();
      event.stopPropagation();

      const kbdSortListOrientation = this.#list?.kbdSortListOrientation();
      const directionalCommands = {
        moveUp:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.up
            : directionalKeys.left,
        moveDown:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.down
            : directionalKeys.right,
        pickUp:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.left
            : directionalKeys.up,
        putDown:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.right
            : directionalKeys.down,
      };

      if (directionalCommands.moveUp.includes(event.key)) {
        if (this.item.activated()) {
          this.item.moveUp();
        } else {
          this.#list?.focusPreviousItem(this.item);
        }
      } else if (directionalCommands.moveDown.includes(event.key)) {
        if (this.item.activated()) {
          this.item.moveDown();
        } else {
          this.#list?.focusNextItem(this.item);
        }
      } else if (
        !this.item.activated() &&
        directionalCommands.pickUp.includes(event.key)
      ) {
        this.item.activate();
      } else if (
        this.item.activated() &&
        directionalCommands.putDown.includes(event.key)
      ) {
        this.item.deactivate();
        this.item.focus('keyboard');
      }
    }
  }
}
