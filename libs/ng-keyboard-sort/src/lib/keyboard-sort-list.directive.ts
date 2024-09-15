import {
  ChangeDetectorRef,
  contentChildren,
  Directive,
  HostListener,
  inject,
  input,
  model,
  OnChanges,
  OnDestroy,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { concatWith, of, Subscription } from 'rxjs';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { KeyboardSortEventDrop } from './keyboard-sort-event-drop';
import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';
import { toObservable } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[kbdSortList]',
  exportAs: 'kbdSortList',
  standalone: true,
  providers: [KeyboardSortListService],
  host: {
    '[attr.tabindex]': 'tabindex()',
  },
})
export class KeyboardSortListDirective implements OnChanges, OnDestroy {
  protected readonly items = contentChildren(KeyboardSortItemDirective);

  protected readonly tabindex = signal<'0' | '-1'>('0');

  public readonly kbdSortListOrientation = input<'horizontal' | 'vertical'>(
    'horizontal'
  );
  public readonly kbdSortListDisabled = input<boolean>(false);
  public readonly kbdSortListData = model<unknown[]>([]);
  public readonly kbdSortEnabled = output<boolean>();
  public readonly kdbSortDrop = output<KeyboardSortEventDrop>();

  readonly #changeDetectorRef = inject(ChangeDetectorRef);
  #focusKeyManager: FocusKeyManager<KeyboardSortItemDirective> | undefined;
  readonly #focusMonitor = inject(FocusMonitor);
  readonly #subscriptions = new Subscription();
  #itemSubscriptions = new Subscription();
  readonly #currentIndex = signal<number | undefined>(undefined);
  readonly #focusIndex = signal<number | undefined>(undefined);
  #midChange = false;
  #listSize = 0;

  constructor(readonly keyboardSortService: KeyboardSortListService) {
    keyboardSortService.list = this;
    this.#subscriptions.add(
      of(this.items())
        .pipe(concatWith(toObservable(this.items)))
        .subscribe((items) => {
          this.#listSize = items.length;
          this.#focusKeyManager?.destroy();
          this.#focusKeyManager =
            new FocusKeyManager<KeyboardSortItemDirective>(items).withWrap();
          this.#subscriptions.add(
            this.#focusKeyManager.change.subscribe((focusedIndex) => {
              this.#focusIndex.set(focusedIndex);
              items.forEach((item, index) => {
                if (index !== focusedIndex && item.focused()) {
                  item.focused.set(false);
                }
              });
            })
          );
          this.#itemSubscriptions.unsubscribe();
          this.#itemSubscriptions = new Subscription();
          items.forEach((item) => {
            this.#itemSubscriptions.add(
              item.kbdSortItemActivated.subscribe((isActive) => {
                if (isActive) {
                  this.#currentIndex.set(item.position());
                }
              })
            );
            this.#itemSubscriptions.add(
              item.kbdSortItemFocused.subscribe((isFocused) => {
                if (isFocused && this.#focusIndex() !== item.position()) {
                  this.#focusIndex.set(item.position());
                  this.focusItem(item);
                } else if (
                  !isFocused &&
                  this.#focusIndex() === item.position()
                ) {
                  this.#focusIndex.set(undefined);
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
        })
    );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['kbdSortListData'] &&
      !changes['kbdSortListData'].isFirstChange()
    ) {
      this.deactivateAll();
    }
    if (
      changes['kbdSortListDisabled'] &&
      changes['kbdSortListDisabled'].previousValue !==
        changes['kbdSortListDisabled'].currentValue &&
      !changes['kbdSortListDisabled'].isFirstChange()
    ) {
      this.kbdSortEnabled.emit(
        changes['kbdSortListDisabled'].currentValue === false
      );
    }
    if (changes['kbdSortListOrientation'] && this.#focusKeyManager) {
      this.#focusKeyManager = this.#focusKeyManager
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
      if (item.position() !== except) {
        item.activated.set(false);
        item.focused.set(false);
      }
    });
  }

  @HostListener('focus')
  public onFocus(): void {
    this.#focusKeyManager?.setFirstItemActive();
  }

  @HostListener('focusout')
  public onFocusOut(): void {
    if (!this.#midChange && this.tabindex() === '-1') {
      this.tabindex.set('0');
    }
  }

  @HostListener('focusin')
  public onFocusIn(): void {
    if (!this.#midChange && this.tabindex() === '0') {
      this.tabindex.set('-1');
    }
  }

  public activateItem(item: KeyboardSortItemDirective): void {
    item.activate();
  }

  public focusItem(item: KeyboardSortItemDirective): void {
    this.#focusKeyManager?.setActiveItem(item);
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

  public moveItemUp(item: KeyboardSortItemDirective): boolean {
    return this.moveItemInDataArray(item.position() - 1, item.position());
  }

  public moveItemDown(item: KeyboardSortItemDirective): boolean {
    return this.moveItemInDataArray(item.position() + 1, item.position());
  }

  private moveItemInDataArray(moveToIndex: number, currentPosition: number) {
    const item = this.items()[currentPosition];
    if (
      !item ||
      item.position() === moveToIndex ||
      moveToIndex < 0 ||
      moveToIndex > this.#listSize - 1
    ) {
      return false;
    }
    item.activate();
    this.#midChange = true;
    this.#focusIndex.set(moveToIndex);
    this.#currentIndex.set(moveToIndex);
    const data = this.kbdSortListData();
    moveItemInArray(data, currentPosition, moveToIndex);
    this.kbdSortListData.set([...data]);
    // Detect changes and finish when the query list is updated.
    this.#changeDetectorRef.detectChanges();
    this.kdbSortDrop.emit({
      previousIndex: currentPosition,
      currentIndex: moveToIndex,
    });
    return true;
  }
}
