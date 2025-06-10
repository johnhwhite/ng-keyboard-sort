import {
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { KeyboardSortItemService } from './keyboard-sort-item.service';
import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';
import { KeyboardSortKeysInterface } from './keyboard-sort-keys.interface';

@Directive({
  selector: '[kbdSortItem]',
  exportAs: 'kbdSortItem',
  host: {
    '[attr.tabindex]': '"-1"',
    '[class.kbd-sort-item]': 'true',
    '[class.kbd-sort-item-disabled]': 'kbdSortItemDisabled()',
    '[class.kbd-sort-item-enabled]': '!kbdSortItemDisabled()',
    '[class.kbd-sort-item-activated]': 'activated()',
    '[class.kbd-sort-item-focused]': 'focused()',
    '(focusout)': 'onFocusOut()',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [KeyboardSortItemService],
})
export class KeyboardSortItemDirective implements FocusableOption {
  public readonly handles = contentChildren(KeyboardSortHandleDirective);

  public position = input.required<number>({
    alias: 'kbdSortItem',
  });
  public readonly activated = model<boolean>(false);
  /**
   * @internal
   */
  public readonly focused = linkedSignal<boolean>(() => !this.activated());
  public readonly kbdSortItemDisabled = model<boolean>(false);

  public get disabled(): boolean {
    return this.kbdSortItemDisabled();
  }
  public set disabled(value: boolean) {
    this.kbdSortItemDisabled.set(value);
  }

  public readonly kbdSortItemActivated = output<boolean>();
  public readonly kbdSortItemFocused = output<boolean>();
  public readonly elementRef = inject(ElementRef<HTMLElement>);

  public readonly isDisabled = computed<boolean>(() => {
    const itemDisabled = this.kbdSortItemDisabled();
    const listDisabled = !!this.#list()?.kbdSortListDisabled();
    return itemDisabled || listDisabled;
  });

  readonly #list = inject(KeyboardSortListService).list;
  readonly #itemService = inject(KeyboardSortItemService, { self: true });
  readonly #keyCombinations = computed<KeyboardSortKeysInterface>(() => {
    const kbdSortListOrientation = this.#list()?.kbdSortListOrientation();
    const keys: KeyboardSortKeysInterface = {
      Toggle: ['Enter', ' '],
      PickUp: [],
      PutDown: ['Escape'],
      MoveUp: [],
      MoveDown: [],
      MoveStart: [],
      MoveEnd: [],
    };
    if (!kbdSortListOrientation) {
      return keys;
    }
    if (kbdSortListOrientation === 'vertical') {
      keys.MoveUp.push('ArrowUp', 'W', 'w');
      keys.MoveDown.push('ArrowDown', 'S', 's');
      keys.MoveStart.push('PageUp');
      keys.MoveEnd.push('PageDown');
      keys.PickUp.push('E', 'e');
      keys.PutDown.push('X', 'x');
    } else {
      keys.MoveUp.push('ArrowLeft', 'A', 'a');
      keys.MoveDown.push('ArrowRight', 'D', 'd');
      keys.MoveStart.push('Home');
      keys.MoveEnd.push('End');
      keys.PickUp.push('ArrowUp', 'W', 'w', 'E', 'e');
      keys.PutDown.push('ArrowDown', 'S', 's', 'X', 'x');
    }
    return {
      ...keys,
      ...this.#list()?.kbdSortKeyOverrides(),
    };
  });

  constructor() {
    this.focused.set(false);
    this.#itemService.item.set(this);
    effect(() => {
      if (this.isDisabled()) {
        this.deactivate();
      }
    });
    effect(() => {
      this.kbdSortItemActivated.emit(this.activated());
      this.kbdSortItemFocused.emit(this.focused());
    });
  }

  public focus(origin?: FocusOrigin): void {
    if (['keyboard', 'program'].includes(origin || '')) {
      if (!this.activated()) {
        this.focused.set(true);
      }
      if (!this.elementRef.nativeElement.matches(':focus-within')) {
        const firstHandle = this.handles().slice().shift();
        if (firstHandle) {
          firstHandle.elementRef.nativeElement.focus();
        } else {
          this.elementRef.nativeElement.focus();
        }
      }
    }
  }

  public onFocusOut(): void {
    if (this.activated()) {
      this.deactivate();
    } else if (this.focused()) {
      this.focused.set(false);
    }
  }

  public onKeydown($event: KeyboardEvent): void {
    if (this.isDisabled() || (!this.activated() && !this.focused())) {
      return;
    }
    const keyCombinations = this.#keyCombinations();
    const anyKey = Object.values(keyCombinations).flat();
    if (anyKey.includes($event.key)) {
      $event.preventDefault();
      $event.stopPropagation();
      if (keyCombinations.Toggle.includes($event.key)) {
        return this.toggleActivated();
      }
      const activated = this.activated();
      if (keyCombinations.MoveUp.includes($event.key)) {
        if (activated) {
          this.moveUp();
        } else {
          this.#list()?.focusPreviousItem(this);
        }
      } else if (keyCombinations.MoveDown.includes($event.key)) {
        if (activated) {
          this.moveDown();
        } else {
          this.#list()?.focusNextItem(this);
        }
      } else if (keyCombinations.MoveStart.includes($event.key)) {
        if (activated) {
          this.moveToStart();
        } else {
          this.#list()?.focusFirstItem();
        }
      } else if (keyCombinations.MoveEnd.includes($event.key)) {
        if (activated) {
          this.moveToEnd();
        } else {
          this.#list()?.focusLastItem();
        }
      } else if (!activated && keyCombinations.PickUp.includes($event.key)) {
        this.activate();
      } else if (activated && keyCombinations.PutDown.includes($event.key)) {
        this.activated.set(false);
        this.focus('keyboard');
      }
    }
  }

  public toggleActivated() {
    if (this.activated() || this.focused()) {
      if (this.activated()) {
        this.deactivate();
        this.focused.set(true);
      } else {
        this.activate();
      }
    }
  }

  public activate() {
    if (!this.activated() && !this.isDisabled()) {
      this.#list()?.deactivateAll(this.position());
      this.activated.set(true);
    }
  }

  public deactivate() {
    this.activated.set(false);
  }

  public moveUp(): boolean {
    return (
      this.activated() && !this.isDisabled() && !!this.#list()?.moveItemUp(this)
    );
  }

  public moveDown(): boolean {
    return (
      this.activated() &&
      !this.isDisabled() &&
      !!this.#list()?.moveItemDown(this)
    );
  }

  public moveToStart(): boolean {
    return (
      this.activated() &&
      !this.isDisabled() &&
      !!this.#list()?.moveItemToStart(this)
    );
  }

  public moveToEnd(): boolean {
    return (
      this.activated() &&
      !this.isDisabled() &&
      !!this.#list()?.moveItemToEnd(this)
    );
  }
}
