import {
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  DOCUMENT,
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortListContext } from './keyboard-sort-list-context';
import { KeyboardSortEventDrop } from './keyboard-sort-event-drop';
import { KeyboardSortKeysInterface } from './keyboard-sort-keys.interface';
import { KEYBOARD_SORT_A11Y_MESSAGES } from './keyboard-sort-a11y-messages';

@Directive({
  selector: '[kbdSortList]',
  exportAs: 'kbdSortList',
  providers: [KeyboardSortListContext],
  host: {
    '[attr.tabindex]': '"-1"',
    '(focus)': 'onFocus()',
    '(keydown.escape)': 'deactivateAll()',
  },
})
export class KeyboardSortListDirective<T extends unknown[]> {
  readonly #doc = inject(DOCUMENT);
  readonly #liveAnnouncer = inject(LiveAnnouncer);
  readonly #messages = inject(KEYBOARD_SORT_A11Y_MESSAGES);
  protected readonly items = contentChildren(KeyboardSortItemDirective);

  /**
   * Override the default keyboard shortcuts.
   *
   * By default, the following keyboard shortcuts are used:
   *  - Toggle: Space or Enter
   *  - Stop and remove focus: Escape
   *
   *  - In horizontal orientation:
   *    - MoveUp: ArrowLeft or "a"
   *    - MoveDown: ArrowRight or "d"
   *    - MoveStart: Home
   *    - MoveEnd: End
   *    - PickUp: ArrowUp, "w", or "e"
   *    - PutDown: ArrowDown, "s", or "x"
   *
   *  - In vertical orientation:
   *    - MoveUp: ArrowUp or "w"
   *    - MoveDown: ArrowDown or "s"
   *    - MoveStart: PageUp
   *    - MoveEnd: PageDown
   *    - PickUp: "e"
   *    - PutDown: "x"
   */
  public readonly kbdSortKeyOverrides = input<
    Partial<KeyboardSortKeysInterface>
  >({});
  public readonly kbdSortListOrientation = input<'horizontal' | 'vertical'>(
    'horizontal'
  );
  public readonly kbdSortListDisabled = input(false, {
    transform: booleanAttribute,
  });
  /**
   * Id of an element (owned by the consumer) describing the list's keyboard
   * controls. Reflected as `aria-describedby` on every item.
   */
  public readonly kbdSortListDescribedBy = input<string>('');
  public readonly kbdSortListData = model<T>();
  public readonly kbdSortEnabled = output<boolean>();
  public readonly kbdSortDrop = output<KeyboardSortEventDrop>();

  /**
   * Index of the item that is the current roving tab stop.
   * @internal
   */
  readonly #activeIndex = signal(0);
  public readonly activeIndex = this.#activeIndex.asReadonly();

  /**
   * Index to restore native focus to once `items()` reflects a reorder.
   * Angular's `@for` reconciliation swaps adjacent items by detaching
   * whichever one currently sits at the higher index and reattaching it at
   * the lower index; if that's the item the user is moving, the detach
   * blurs it. This re-asserts focus once the DOM has settled.
   * @internal
   */
  readonly #pendingFocusIndex = signal<number | undefined>(undefined);

  readonly #activatedItem = computed(() =>
    this.items().find((item) => item.activated())
  );
  readonly #focusedItem = computed(() =>
    this.items().find((item) => item.focused())
  );
  #trackedActivatedItem: KeyboardSortItemDirective | undefined;
  #startingIndex: number | undefined;

  readonly #enabledChange = linkedSignal({
    source: this.kbdSortListDisabled,
    computation: (_src, prev) => prev?.value !== undefined,
    equal: () => false,
  });

  constructor() {
    inject(KeyboardSortListContext).list.set(this);
    effect(() => {
      const enabledChange = this.#enabledChange();
      const kbdSortListDisabled = this.kbdSortListDisabled();
      if (enabledChange) {
        if (kbdSortListDisabled) {
          this.deactivateAll();
        }
        this.kbdSortEnabled.emit(!kbdSortListDisabled);
      }
    });
    // Emits `kbdSortDrop` and announces pick up/put down when the activated
    // item transitions to and from deactivated.
    effect(() => {
      const activatedItem = this.#activatedItem();
      if (activatedItem) {
        if (this.#trackedActivatedItem !== activatedItem) {
          this.#trackedActivatedItem = activatedItem;
          this.#announce(
            this.#messages.grabbed(
              activatedItem.label(),
              activatedItem.position(),
              this.items().length
            )
          );
        }
        return;
      }
      const item = this.#trackedActivatedItem;
      this.#trackedActivatedItem = undefined;
      const previousIndex = this.#startingIndex;
      this.#startingIndex = undefined;
      if (
        item &&
        previousIndex !== undefined &&
        !this.kbdSortListDisabled() &&
        !item.isDisabled()
      ) {
        this.kbdSortDrop.emit({
          previousIndex,
          currentIndex: item.position(),
        });
        this.#announce(
          this.#messages.dropped(
            item.label(),
            item.position(),
            this.items().length
          )
        );
      }
    });
    // Keeps the roving tab stop in sync when an item is focused by means
    // other than this directive's own navigation methods (e.g. a consumer
    // calling `item.focus()` directly).
    effect(() => {
      const focusedItem = this.#focusedItem();
      if (
        focusedItem &&
        untracked(this.#activeIndex) !== focusedItem.position()
      ) {
        this.#activeIndex.set(focusedItem.position());
      }
    });
    // Restores native focus after a reorder; see #pendingFocusIndex.
    effect(() => {
      const items = this.items();
      const pending = untracked(this.#pendingFocusIndex);
      if (pending === undefined) {
        return;
      }
      this.#pendingFocusIndex.set(undefined);
      items[pending]?.focus('program');
    });
  }

  /**
   * The host itself is never a stop in the natural tab order (only the
   * roving item is), but it stays focusable so a consumer can call
   * `list.focus()` to move keyboard focus straight into the list.
   */
  public onFocus(): void {
    this.#setActiveIndex(this.#activeIndex());
  }

  /**
   * Whether a reorder is between the DOM update that may have blurred the
   * moving item and this directive re-asserting its focus. Items consult
   * this to ignore that blur instead of treating it as a real focus-out.
   * @internal
   */
  public hasPendingFocusRestore(): boolean {
    return this.#pendingFocusIndex() !== undefined;
  }

  public deactivateAll(except?: number): void {
    this.items().forEach((item) => {
      const activate = item.position() === except;
      if (activate) {
        if (this.#startingIndex === undefined) {
          this.#startingIndex = except;
        }
      } else {
        item.activated.set(false);
        item.focused.set(false);
        if (item.elementRef.nativeElement.contains(this.#doc.activeElement)) {
          item.elementRef.nativeElement.blur();
        }
      }
    });
  }

  public activateItem(item: KeyboardSortItemDirective | number): void {
    this.focusItem(item);
    if (item instanceof KeyboardSortItemDirective) {
      item.activate();
    } else {
      const items = this.items();
      if (items.length && item >= 0 && item < items.length) {
        items[item].activate();
      }
    }
  }

  public focusItem(item: KeyboardSortItemDirective | number): void {
    const items = this.items();
    const index = typeof item === 'number' ? item : items.indexOf(item);
    this.#setActiveIndex(index);
  }

  public focusPreviousItem(item: KeyboardSortItemDirective): void {
    const size = this.items().length;
    this.#setActiveIndex(item.position() > 0 ? item.position() - 1 : size - 1);
  }

  public focusNextItem(item: KeyboardSortItemDirective): void {
    const size = this.items().length;
    this.#setActiveIndex(item.position() < size - 1 ? item.position() + 1 : 0);
  }

  public focusFirstItem(): void {
    this.#setActiveIndexSkippingDisabled(0, 1);
  }

  public focusLastItem(): void {
    this.#setActiveIndexSkippingDisabled(this.items().length - 1, -1);
  }

  public moveItemUp(item: KeyboardSortItemDirective): boolean {
    return this.#moveItemInDataArray(item.position() - 1, item.position());
  }

  public moveItemDown(item: KeyboardSortItemDirective): boolean {
    return this.#moveItemInDataArray(item.position() + 1, item.position());
  }

  public moveItemToStart(item: KeyboardSortItemDirective): boolean {
    return this.#moveItemInDataArray(0, item.position());
  }

  public moveItemToEnd(item: KeyboardSortItemDirective): boolean {
    return this.#moveItemInDataArray(Number.MAX_VALUE, item.position());
  }

  #setActiveIndex(index: number): void {
    const items = this.items();
    const item = items[index];
    if (!item) {
      return;
    }
    this.#activeIndex.set(index);
    items.forEach((other, otherIndex) => {
      if (otherIndex !== index && other.focused()) {
        other.focused.set(false);
      }
    });
    item.focus('program');
  }

  #setActiveIndexSkippingDisabled(index: number, fallbackDelta: number): void {
    const items = this.items();
    if (!items[index]) {
      return;
    }
    while (items[index]?.disabled) {
      index += fallbackDelta;
      if (!items[index]) {
        return;
      }
    }
    this.#setActiveIndex(index);
  }

  #moveItemInDataArray(moveToIndex: number, currentPosition: number): boolean {
    const item = this.items()[currentPosition];
    const data = (this.kbdSortListData() ?? []).slice();
    if (moveToIndex === Number.MAX_VALUE) {
      moveToIndex = data.length - 1;
    }
    if (
      !item ||
      item.isDisabled() ||
      !data.length ||
      item.position() === moveToIndex ||
      moveToIndex < 0 ||
      moveToIndex > data.length - 1
    ) {
      return false;
    }
    item.activate();
    this.#activeIndex.set(moveToIndex);
    this.#pendingFocusIndex.set(moveToIndex);
    moveItemInArray(data, currentPosition, moveToIndex);
    this.kbdSortListData.set(data as T);
    this.#announce(
      this.#messages.moved(item.label(), moveToIndex, data.length)
    );
    return true;
  }

  #announce(message: string): void {
    void this.#liveAnnouncer.announce(message);
  }
}
