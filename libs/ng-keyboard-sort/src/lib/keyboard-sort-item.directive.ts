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
  numberAttribute,
  output,
} from '@angular/core';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';
import { KeyboardSortListContext } from './keyboard-sort-list-context';
import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';
import { KeyboardSortKeysInterface } from './keyboard-sort-keys.interface';

type KeyboardSortAction = keyof KeyboardSortKeysInterface;

/**
 * Resolution order when `kbdSortKeyOverrides` maps the same key to more
 * than one action.
 */
const ACTION_PRIORITY: readonly KeyboardSortAction[] = [
  'Toggle',
  'MoveUp',
  'MoveDown',
  'MoveStart',
  'MoveEnd',
  'PickUp',
  'PutDown',
];

@Directive({
  selector: '[kbdSortItem]',
  exportAs: 'kbdSortItem',
  host: {
    '[attr.tabindex]': 'isActiveTabStop() ? "0" : "-1"',
    '[class.kbd-sort-item]': 'true',
    '[class.kbd-sort-item-disabled]': 'kbdSortItemDisabled()',
    '[class.kbd-sort-item-enabled]': '!kbdSortItemDisabled()',
    '[class.kbd-sort-item-activated]': 'activated()',
    '[class.kbd-sort-item-focused]': 'focused()',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-roledescription]': 'kbdSortItemRoleDescription() || null',
    '(focus)': 'onFocus()',
    '(focusout)': 'onFocusOut()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class KeyboardSortItemDirective implements FocusableOption {
  public readonly handles = contentChildren(KeyboardSortHandleDirective);

  public position = input.required<number, unknown>({
    alias: 'kbdSortItem',
    transform: numberAttribute,
  });
  public readonly activated = model<boolean>(false);
  /**
   * @internal
   */
  public readonly focused = linkedSignal<boolean>(() => !this.activated());
  public readonly kbdSortItemDisabled = model<boolean>(false);
  /**
   * Accessible label announced when this item is grabbed, moved, or
   * dropped. Defaults to the item's text content.
   */
  public readonly kbdSortItemLabel = input<string>('');
  /**
   * Sets `aria-roledescription` on this item (e.g. "sortable item"). Left
   * unset by default: only the consumer knows whether the item already has
   * a native or ARIA role this would conflict with.
   */
  public readonly kbdSortItemRoleDescription = input<string>('');

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

  /**
   * Whether this item is the list's current roving tab stop.
   * @internal
   */
  protected readonly isActiveTabStop = computed<boolean>(() => {
    const list = this.#list();
    return (
      !!list &&
      !list.kbdSortListDisabled() &&
      list.activeIndex() === this.position()
    );
  });

  /**
   * Label announced for this item. Falls back to the item's text content
   * when `kbdSortItemLabel` isn't set.
   * @internal
   */
  public readonly label = computed<string>(() => {
    const explicit = this.kbdSortItemLabel();
    return explicit || this.elementRef.nativeElement.textContent?.trim() || '';
  });

  /**
   * @internal
   */
  protected readonly describedBy = computed<string | null>(
    () => this.#list()?.kbdSortListDescribedBy() || null
  );

  readonly #list = inject(KeyboardSortListContext).list;
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
  readonly #keyActionMap = computed<Map<string, KeyboardSortAction>>(() => {
    const keys = this.#keyCombinations();
    const map = new Map<string, KeyboardSortAction>();
    for (const action of ACTION_PRIORITY) {
      for (const key of keys[action]) {
        if (!map.has(key)) {
          map.set(key, action);
        }
      }
    }
    return map;
  });

  constructor() {
    this.focused.set(false);
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

  /**
   * Reacts to native focus landing on this item directly (e.g. sequential
   * Tab navigation, which lands on whichever item is the current roving tab
   * stop) without going through `focus()` below.
   */
  public onFocus(): void {
    if (!this.activated()) {
      this.focused.set(true);
    }
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
    if (this.#list()?.hasPendingFocusRestore()) {
      // The reorder this item just performed may have blurred it as a side
      // effect of Angular's DOM reconciliation, not a real focus-out.
      return;
    }
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
    const action = this.#keyActionMap().get($event.key);
    if (!action) {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();
    const activated = this.activated();
    switch (action) {
      case 'Toggle':
        this.toggleActivated();
        break;
      case 'MoveUp':
        if (activated) {
          this.moveUp();
        } else {
          this.#list()?.focusPreviousItem(this);
        }
        break;
      case 'MoveDown':
        if (activated) {
          this.moveDown();
        } else {
          this.#list()?.focusNextItem(this);
        }
        break;
      case 'MoveStart':
        if (activated) {
          this.moveToStart();
        } else {
          this.#list()?.focusFirstItem();
        }
        break;
      case 'MoveEnd':
        if (activated) {
          this.moveToEnd();
        } else {
          this.#list()?.focusLastItem();
        }
        break;
      case 'PickUp':
        if (!activated) {
          this.activate();
        }
        break;
      case 'PutDown':
        if (activated) {
          this.activated.set(false);
          this.focus('keyboard');
        }
        break;
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
