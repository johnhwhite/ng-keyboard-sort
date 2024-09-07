import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { concatWith, of, Subscription } from 'rxjs';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { KeyboardSortEventDrop } from './keyboard-sort-event-drop';
import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';

@Directive({
  selector: '[kbdSortList]',
  exportAs: 'kbdSortList',
  standalone: true,
  providers: [KeyboardSortListService],
})
export class KeyboardSortListDirective
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ContentChildren(KeyboardSortItemDirective)
  protected items: QueryList<KeyboardSortItemDirective> | undefined;

  @HostBinding('attr.tabindex')
  protected tabindex: '0' | '-1' = '0';

  @Input()
  public kbdSortListOrientation: 'horizontal' | 'vertical' = 'horizontal';

  @Input({ transform: booleanAttribute })
  public kbdSortListDisabled = false;

  @Input({ required: true })
  public kbdSortListData: unknown[] = [];

  @Output()
  public readonly kbdSortEnabled = new EventEmitter<boolean>();

  @Output()
  public readonly kdbSortDrop = new EventEmitter<KeyboardSortEventDrop>();

  readonly #changeDetectorRef = inject(ChangeDetectorRef);
  #focusKeyManager: FocusKeyManager<KeyboardSortItemDirective> | undefined;
  readonly #focusMonitor = inject(FocusMonitor);
  readonly #subscriptions = new Subscription();
  #itemSubscriptions = new Subscription();
  #previousIndex: number | undefined;
  #currentIndex: number | undefined;
  #focusIndex: number | undefined;
  #midChange = false;
  #listSize = 0;

  constructor(readonly keyboardSortService: KeyboardSortListService) {
    keyboardSortService.list = this;
  }

  public ngAfterViewInit(): void {
    if (this.items?.changes) {
      this.#focusKeyManager = new FocusKeyManager<KeyboardSortItemDirective>(
        this.items
      ).withWrap();
      if (this.#focusKeyManager) {
        this.#subscriptions.add(
          this.#focusKeyManager.change.subscribe((focusedIndex) => {
            this.#focusIndex = focusedIndex;
            this.items?.forEach((item, index) => {
              if (index !== focusedIndex && item.focused) {
                item.focused = false;
              }
            });
            this.#changeDetectorRef.markForCheck();
          })
        );
      }
      this.#subscriptions.add(
        of(this.items)
          .pipe(concatWith(this.items.changes))
          .subscribe((items: QueryList<KeyboardSortItemDirective>) => {
            this.#listSize = items.length;
            this.#itemSubscriptions.unsubscribe();
            this.#itemSubscriptions = new Subscription();
            items.forEach((item) => {
              this.#itemSubscriptions.add(
                item.kbdSortItemActivated.subscribe((isActive) => {
                  if (isActive) {
                    if (typeof this.#previousIndex === 'undefined') {
                      this.#previousIndex = item.position;
                    }
                    this.#currentIndex = item.position;
                  } else if (!this.#midChange) {
                    if (
                      this.#previousIndex !== undefined &&
                      this.#currentIndex !== undefined &&
                      this.#previousIndex !== this.#currentIndex
                    ) {
                      this.kdbSortDrop.emit({
                        previousIndex: this.#previousIndex,
                        currentIndex: this.#currentIndex,
                      });
                    }
                    this.#previousIndex = undefined;
                    this.#currentIndex = undefined;
                  }
                  this.#changeDetectorRef.markForCheck();
                })
              );
              this.#itemSubscriptions.add(
                item.kbdSortItemFocused.subscribe((isFocused) => {
                  if (isFocused && this.#focusIndex !== item.position) {
                    this.#focusIndex = item.position;
                    this.focusItem(item);
                  } else if (!isFocused && this.#focusIndex === item.position) {
                    this.#focusIndex = undefined;
                  }
                  this.#changeDetectorRef.markForCheck();
                })
              );
            });
            if (this.#midChange) {
              this.#midChange = false;
              if (typeof this.#currentIndex !== 'undefined') {
                const item = this.items?.get(this.#currentIndex);
                if (item) {
                  this.focusItem(item);
                  this.activateItem(item);
                  this.#changeDetectorRef.detectChanges();
                }
              }
            }
          })
      );
    }
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
    this.items?.forEach((item) => {
      this.#focusMonitor.stopMonitoring(item.elementRef);
    });
  }

  @HostListener('keydown.escape')
  public deactivateAll(except?: number): void {
    this.items?.forEach((item) => {
      if (item.position !== except) {
        item.activated = false;
        item.focused = false;
      }
    });
  }

  @HostListener('focus')
  public onFocus(): void {
    this.#focusKeyManager?.setFirstItemActive();
  }

  @HostListener('focusout')
  public onFocusOut(): void {
    /* istanbul ignore if */
    if (this.#midChange) {
      return;
    }
    if (this.tabindex === '-1') {
      this.tabindex = '0';
      this.#changeDetectorRef.markForCheck();
    }
  }

  @HostListener('focusin')
  public onFocusIn(): void {
    /* istanbul ignore if */
    if (this.#midChange) {
      return;
    }
    if (this.tabindex === '0') {
      this.tabindex = '-1';
      this.#changeDetectorRef.markForCheck();
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
      item.position > 0 ? item.position - 1 : this.#listSize - 1
    );
  }

  public focusNextItem(item: KeyboardSortItemDirective): void {
    this.#focusKeyManager?.setActiveItem(
      item.position < this.#listSize - 1 ? item.position + 1 : 0
    );
  }

  public moveItemUp(item: KeyboardSortItemDirective): boolean {
    return this.moveItemInDataArray(item.position - 1, item.position);
  }

  public moveItemDown(item: KeyboardSortItemDirective): boolean {
    return this.moveItemInDataArray(item.position + 1, item.position);
  }

  private moveItemInDataArray(moveToIndex: number, currentPosition: number) {
    const item = this.items?.get(currentPosition);
    if (
      !item ||
      item.position === moveToIndex ||
      moveToIndex < 0 ||
      moveToIndex > this.#listSize - 1
    ) {
      return false;
    }
    item.activate();
    this.#midChange = true;
    this.#focusIndex = moveToIndex;
    this.#currentIndex = moveToIndex;
    moveItemInArray(this.kbdSortListData, currentPosition, moveToIndex);
    // Detect changes and finish when the query list is updated.
    this.#changeDetectorRef.detectChanges();
    return true;
  }
}
