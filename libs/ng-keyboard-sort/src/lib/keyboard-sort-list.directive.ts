import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
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
import { concatWith, finalize, first, of, Subscription } from 'rxjs';
import { KeyboardSortEvent } from './keyboard-sort-event';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { KeyboardSortEventDrop } from './keyboard-sort-event-drop';
import { FocusKeyManager, FocusMonitor } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[kbdSortList]',
  exportAs: 'kbdSortList',
  standalone: true,
  providers: [
    {
      provide: KeyboardSortListService,
      useFactory: () => new KeyboardSortListService(),
    },
  ],
})
export class KeyboardSortListDirective
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ContentChildren(KeyboardSortItemDirective)
  public items: QueryList<KeyboardSortItemDirective> | undefined;

  @HostBinding('attr.tabindex')
  public tabindex: '0' | '-1' = '0';

  @Input()
  public kbdSortListOrientation: 'horizontal' | 'vertical' = 'horizontal';

  @Input()
  public kbdSortListDisabled = false;

  @Input({ required: true })
  public kbdSortListData: unknown[] = [];

  @Output()
  public kbdSortEnabled = new EventEmitter<boolean>();

  @Output()
  public kdbSortDrop = new EventEmitter<KeyboardSortEventDrop>();

  @Output()
  public kdbSortEnd = new EventEmitter<KeyboardSortEvent>();

  readonly #appRef = inject(ApplicationRef);
  readonly #changeDetectorRef = inject(ChangeDetectorRef);
  readonly #doc = inject(DOCUMENT);
  readonly #elementRef = inject(ElementRef<HTMLElement>);
  #focusKeyManager: FocusKeyManager<KeyboardSortItemDirective> | undefined;
  readonly #focusMonitor = inject(FocusMonitor);
  readonly #subscriptions = new Subscription();
  #itemSubscriptions = new Subscription();
  #previousIndex: number | undefined;
  #currentIndex: number | undefined;
  #focusIndex: number | undefined;
  #midChange = false;

  constructor(readonly keyboardSortService: KeyboardSortListService) {
    keyboardSortService.list = this;
  }

  public ngAfterViewInit(): void {
    this.#subscriptions.add(
      this.#focusMonitor.monitor(this.#elementRef, true).subscribe((origin) => {
        if (['keyboard'].includes(origin || '')) {
          if (this.tabindex === '0') {
            this.tabindex = '-1';
            this.#changeDetectorRef.markForCheck();
          }
        } else if (!origin && this.tabindex === '-1' && !this.#midChange) {
          this.tabindex = '0';
          this.#changeDetectorRef.markForCheck();
        }
      })
    );
    if (this.items?.changes) {
      this.#focusKeyManager = new FocusKeyManager<KeyboardSortItemDirective>(
        this.items
      ).withWrap();
      if (this.#focusKeyManager) {
        this.#subscriptions.add(
          this.#focusKeyManager.change.subscribe((focusedIndex) => {
            this.#focusIndex = focusedIndex;
            this.items?.forEach((item, index) => {
              if (index !== focusedIndex) {
                item.focused = false;
              }
            });
          })
        );
      }
      this.#subscriptions.add(
        of(this.items)
          .pipe(concatWith(this.items.changes))
          .subscribe((items: QueryList<KeyboardSortItemDirective>) => {
            this.#itemSubscriptions.unsubscribe();
            this.#itemSubscriptions = new Subscription();
            items.forEach((item) => {
              this.#itemSubscriptions.add(
                item.kbdSortItemActivated.subscribe(() => {
                  this.#changeDetectorRef.markForCheck();
                })
              );
              this.#itemSubscriptions.add(
                item.kbdSortItemFocused.subscribe(() => {
                  this.#changeDetectorRef.markForCheck();
                })
              );
              this.#itemSubscriptions.add(
                this.#focusMonitor
                  .monitor(item.elementRef, true)
                  .subscribe((focusUpdate) => {
                    if (['keyboard', 'program'].includes(focusUpdate || '')) {
                      if (!item.isDisabled()) {
                        if (this.#focusIndex !== item.position) {
                          this.#focusIndex = item.position;
                          this.focusItem(item);
                        }
                      }
                    } else {
                      if (this.#focusIndex === item.position) {
                        this.#focusIndex = undefined;
                        this.deactivateAll();
                      }
                    }
                  })
              );
            });
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
  }

  @HostListener('keydown.escape')
  public deactivateAll(): void {
    this.items?.forEach((item) => {
      this.dropItem(item);
      item.focused = false;
    });
    this.kdbSortEnd.emit({
      list: this,
    });
  }

  @HostListener('focus')
  public onFocus(): void {
    this.#focusKeyManager?.setFirstItemActive();
  }

  public activateItem(item: KeyboardSortItemDirective): void {
    item.activate();
  }

  public focusItem(item: KeyboardSortItemDirective): void {
    this.#focusKeyManager?.setActiveItem(item);
  }

  public focusPreviousItem(item: KeyboardSortItemDirective): void {
    this.#focusKeyManager?.setActiveItem(
      item.position > 0 ? item.position - 1 : this.#getListSize() - 1
    );
  }

  public focusNextItem(item: KeyboardSortItemDirective): void {
    this.#focusKeyManager?.setActiveItem(
      item.position < this.#getListSize() - 1 ? item.position + 1 : 0
    );
  }

  public moveItemUp(item: KeyboardSortItemDirective): boolean {
    if (this.items?.length) {
      const currentPosition = item.position;
      if (currentPosition > 0) {
        const moveToIndex = currentPosition - 1;
        if (!this.#previousIndex) {
          this.#previousIndex = currentPosition;
        }
        this.#currentIndex = moveToIndex;
        this.#midChange = true;
        this.#itemSubscriptions.add(
          this.#appRef.isStable
            .pipe(
              first((isStable) => isStable),
              finalize(() => {
                this.#midChange = false;
              })
            )
            .subscribe(() => {
              this.#midChange = false;
            })
        );
        moveItemInArray(this.kbdSortListData, currentPosition, moveToIndex);
        this.#changeDetectorRef.detectChanges();
        this.activateItem(this.items?.toArray()[moveToIndex]);
        this.#focusKeyManager?.setActiveItem(moveToIndex);
        return true;
      }
    }
    return false;
  }

  public moveItemDown(item: KeyboardSortItemDirective): boolean {
    if (this.items?.length) {
      const items = this.items.toArray();
      const currentPosition = items.indexOf(item);
      const currentLastPosition = items.length - 1;
      if (currentPosition > -1) {
        if (currentPosition < currentLastPosition) {
          const moveToIndex = currentPosition + 1;
          if (!this.#previousIndex) {
            this.#previousIndex = currentPosition;
          }
          this.#currentIndex = moveToIndex;
          this.#midChange = true;
          this.#itemSubscriptions.add(
            this.#appRef.isStable
              .pipe(
                first((isStable) => isStable),
                finalize(() => {
                  this.#midChange = false;
                })
              )
              .subscribe(() => {
                this.#midChange = false;
              })
          );
          moveItemInArray(this.kbdSortListData, currentPosition, moveToIndex);
          this.#changeDetectorRef.detectChanges();
          this.activateItem(this.items?.toArray()[moveToIndex]);
          this.#focusKeyManager?.setActiveItem(moveToIndex);
          return true;
        }
      }
    }
    return false;
  }

  public dropItem(item: KeyboardSortItemDirective): void {
    if (item.activated) {
      item.activated = false;
      if (
        this.#previousIndex !== undefined &&
        this.#currentIndex !== undefined &&
        this.#previousIndex !== this.#currentIndex
      ) {
        this.kdbSortDrop.emit({
          previousIndex: this.#previousIndex,
          currentIndex: this.#currentIndex,
        });
        this.#previousIndex = undefined;
        this.#currentIndex = undefined;
      }
    }
  }

  public capturePreviousIndex(item: KeyboardSortItemDirective): void {
    if (item.activated) {
      this.#previousIndex = item.position;
    }
  }

  #getListSize(): number {
    return this.items?.length || 0;
  }
}
