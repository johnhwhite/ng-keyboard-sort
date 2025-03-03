import {
  ChangeDetectorRef,
  contentChildren,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  linkedSignal,
  model,
  OnChanges,
  OnDestroy,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { Subscription } from 'rxjs';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { KeyboardSortEventDrop } from './keyboard-sort-event-drop';
import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';
import { toObservable } from '@angular/core/rxjs-interop';
import { KeyboardSortKeysInterface } from './keyboard-sort-keys.interface';

@Directive({
  selector: '[kbdSortList]',
  exportAs: 'kbdSortList',
  providers: [KeyboardSortListService],
  host: {
    '[attr.tabindex]': 'tabindex()',
  },
})
export class KeyboardSortListDirective<T extends unknown[]>
  implements OnChanges, OnDestroy
{
  readonly #elementRef = inject(ElementRef);
  readonly #doc = inject(DOCUMENT);
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
  public readonly kbdSortListDisabled = input<boolean>(false);
  public readonly kbdSortListData = model<T>();
  public readonly kbdSortEnabled = output<boolean>();
  public readonly kdbSortDrop = output<KeyboardSortEventDrop>();

  protected readonly tabindex = linkedSignal<'0' | '-1'>(() => {
    if (
      this.kbdSortListDisabled() ||
      this.#elementRef.nativeElement.contains(this.#doc.activeElement)
    ) {
      return '-1';
    }
    return '0';
  });

  readonly #changeDetectorRef = inject(ChangeDetectorRef);
  #focusKeyManager: FocusKeyManager<KeyboardSortItemDirective> | undefined;
  readonly #focusMonitor = inject(FocusMonitor);
  readonly #subscriptions = new Subscription();
  #itemSubscriptions = new Subscription();
  readonly #currentIndex = signal<number | undefined>(undefined);
  readonly #focusIndex = signal<number | undefined>(undefined);
  readonly #startingIndex = signal<number | undefined>(undefined);
  #midChange = false;
  #listSize = 0;

  constructor() {
    inject(KeyboardSortListService<T>).list.set(this);
    this.#subscriptions.add(
      toObservable(this.items).subscribe((items) => this.#resetItems(items))
    );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['kbdSortListDisabled'] &&
      changes['kbdSortListDisabled'].previousValue !==
        changes['kbdSortListDisabled'].currentValue &&
      !changes['kbdSortListDisabled'].isFirstChange()
    ) {
      if (changes['kbdSortListDisabled'].currentValue) {
        this.deactivateAll();
      }
      this.kbdSortEnabled.emit(
        changes['kbdSortListDisabled'].currentValue === false
      );
    }
    if (changes['kbdSortListOrientation'] && this.#focusKeyManager) {
      this.#focusKeyManager
        .withHorizontalOrientation(
          changes['kbdSortListOrientation'].currentValue === 'horizontal'
            ? 'ltr'
            : null
        )
        .withVerticalOrientation(
          changes['kbdSortListOrientation'].currentValue === 'vertical'
        );
    }
  }

  public ngOnDestroy(): void {
    this.#itemSubscriptions.unsubscribe();
    this.#subscriptions.unsubscribe();
    this.items().forEach((item) => {
      this.#focusMonitor.stopMonitoring(item.elementRef);
    });
  }

  @HostListener('keydown.escape')
  public deactivateAll(except?: number): void {
    this.items().forEach((item) => {
      const activate = item.position() === except;
      if (activate) {
        if (this.#startingIndex() === undefined) {
          this.#startingIndex.set(except);
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

  @HostListener('focus')
  public onFocus(): void {
    this.#focusKeyManager?.setActiveItem(this.#focusIndex() ?? 0);
  }

  @HostListener('focusout')
  public onFocusOut(): void {
    if (this.kbdSortListDisabled()) {
      return;
    }
    if (!this.#midChange) {
      this.tabindex.set('0');
    }
  }

  @HostListener('focusin')
  public onFocusIn(): void {
    const enabled = !this.kbdSortListDisabled();
    if (!this.#midChange && enabled) {
      this.tabindex.set('-1');
    }
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
    if (item instanceof KeyboardSortItemDirective) {
      this.#focusKeyManager?.setActiveItem(item);
    } else {
      this.#focusKeyManager?.setActiveItem(item);
    }
  }

  public focusPreviousItem(item: KeyboardSortItemDirective): void {
    this.#focusKeyManager?.setActiveItem(
      item.position() > 0 ? item.position() - 1 : this.#listSize - 1
    );
  }

  public focusNextItem(item: KeyboardSortItemDirective): void {
    this.#focusKeyManager?.setActiveItem(
      item.position() < this.#listSize - 1 ? item.position() + 1 : 0
    );
  }

  public focusFirstItem(): void {
    this.#focusKeyManager?.setFirstItemActive();
  }

  public focusLastItem(): void {
    this.#focusKeyManager?.setLastItemActive();
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

  #moveItemInDataArray(moveToIndex: number, currentPosition: number) {
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
    this.#midChange = true;
    moveItemInArray(data, currentPosition, moveToIndex);
    this.#itemSubscriptions.unsubscribe();
    this.#focusIndex.set(moveToIndex);
    this.#currentIndex.set(moveToIndex);
    this.kbdSortListData.set(data as T);
    // Detect changes and finish when the query list is updated.
    this.#changeDetectorRef.detectChanges();
    return true;
  }

  #resetItems(items: readonly KeyboardSortItemDirective[]): void {
    this.#listSize = items.length;
    this.#itemSubscriptions.unsubscribe();
    this.#itemSubscriptions = new Subscription();
    this.#focusIndex.set(undefined);
    this.#focusKeyManager = new FocusKeyManager<KeyboardSortItemDirective>(
      items
    ).withWrap();
    this.#itemSubscriptions.add(() => this.#focusKeyManager?.destroy());
    this.#itemSubscriptions.add(
      this.#focusKeyManager.change.subscribe((focusedIndex) => {
        this.#focusIndex.set(focusedIndex);
        items.forEach((item, index) => {
          if (index !== focusedIndex && item.focused()) {
            item.focused.set(false);
          }
        });
      })
    );
    items.forEach((item) => {
      this.#itemSubscriptions.add(
        item.kbdSortItemActivated.subscribe((isActive) => {
          if (isActive) {
            this.#currentIndex.set(item.position());
          } else {
            if (
              !this.kbdSortListDisabled() &&
              !item.isDisabled() &&
              item.position() === this.#currentIndex()
            ) {
              const previousIndex = this.#startingIndex();
              const currentIndex = this.#currentIndex();
              if (
                typeof previousIndex !== 'undefined' &&
                typeof currentIndex !== 'undefined'
              ) {
                this.kdbSortDrop.emit({ previousIndex, currentIndex });
              }
              this.#startingIndex.set(undefined);
            }
          }
        })
      );
      this.#itemSubscriptions.add(
        item.kbdSortItemFocused.subscribe((isFocused) => {
          if (isFocused && this.#focusIndex() !== item.position()) {
            this.focusItem(item);
          }
        })
      );
    });
    if (this.#midChange) {
      this.#midChange = false;
      const currentIndex = this.#currentIndex();
      if (typeof currentIndex !== 'undefined') {
        const item = items[currentIndex];
        if (item) {
          this.focusItem(item);
          this.activateItem(item);
        }
      }
    }
  }
}
