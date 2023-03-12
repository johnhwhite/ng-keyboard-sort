import {
  ApplicationRef,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { filter, Subscription, take } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { KeyboardSortEvent } from './keyboard-sort-event';
import { KeyboardSortService } from './keyboard-sort.service';
import { KeyboardSortEventDrop } from './keyboard-sort-event-drop';

@Directive({
  selector: '[kbdSortList]',
  exportAs: 'kbdSortList',
  standalone: true,
  providers: [
    {
      provide: KeyboardSortService,
      useFactory: () => new KeyboardSortService(),
    },
  ],
})
export class KeyboardSortListDirective implements OnDestroy {
  @ContentChildren(KeyboardSortItemDirective, { descendants: false })
  public items: QueryList<KeyboardSortItemDirective> | undefined;

  @Input()
  public kbdSortListOrientation: 'horizontal' | 'vertical' = 'horizontal';

  @Input()
  public get kbdSortListDisabled(): boolean {
    return this.#kbdSortListDisabled;
  }
  public set kbdSortListDisabled(value: boolean) {
    this.#kbdSortListDisabled = value;
    this.kbdSortEnabled.emit(!value);
  }

  @Input()
  public kbdSortListData: unknown[] | undefined = [];

  @Output()
  public kbdSortEnabled = new EventEmitter<boolean>();

  @Output()
  public kdbSortDrop = new EventEmitter<KeyboardSortEventDrop>();

  @Output()
  public kdbSortEnd = new EventEmitter<KeyboardSortEvent>();

  #appRef: ApplicationRef;
  #changeDetectorRef: ChangeDetectorRef;
  #doc: Document;
  #elementRef: ElementRef;
  #subscriptions = new Subscription();
  #kbdSortListDisabled = false;
  #previousIndex: number | undefined;
  #currentIndex: number | undefined;

  constructor(
    readonly changeDetectorRef: ChangeDetectorRef,
    readonly appRef: ApplicationRef,
    readonly elementRef: ElementRef,
    @Inject(DOCUMENT) readonly document: Document,
    readonly keyboardSortService: KeyboardSortService
  ) {
    this.#changeDetectorRef = changeDetectorRef;
    this.#appRef = appRef;
    this.#elementRef = elementRef;
    this.#doc = document;
    keyboardSortService.list = this;
  }

  public ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }

  @HostListener('blur')
  public clearActivated(): void {
    if (
      this.#doc.activeElement &&
      !this.#elementRef.nativeElement.contains(this.#doc.activeElement)
    ) {
      this.deactivateAll();
    }
  }

  @HostListener('document:keydown.Escape')
  public deactivateAll(): void {
    if (this.#previousIndex !== undefined && this.#currentIndex !== undefined) {
      this.kdbSortDrop.emit({
        previousIndex: this.#previousIndex,
        currentIndex: this.#currentIndex,
      });
      this.#previousIndex = undefined;
      this.#currentIndex = undefined;
    }
    this.items?.forEach((item, index) => {
      item.deactivate();
      item.focused = false;
      item.tabindex = index === 0 ? '0' : '-1';
    });
    this.#changeDetectorRef.detectChanges();
    this.kdbSortEnd.emit({
      list: this,
    });
  }

  public activateItem(item: KeyboardSortItemDirective): void {
    item.activate();
  }

  public activateNextItem(item: KeyboardSortItemDirective): void {
    if (this.items?.length) {
      const items = this.items.toArray();
      const currentPosition = items.indexOf(item);
      if (currentPosition > -1) {
        const nextItem = items[currentPosition + 1];
        if (nextItem) {
          nextItem.focusOnHandle();
        }
      }
    }
  }

  public activatePreviousItem(item: KeyboardSortItemDirective): void {
    if (this.items?.length) {
      const items = this.items.toArray();
      const currentPosition = items.indexOf(item);
      if (currentPosition > -1) {
        const previousItem = items[currentPosition - 1];
        if (previousItem) {
          previousItem.focusOnHandle();
        }
      }
    }
  }

  public focusItem(item: KeyboardSortItemDirective): void {
    this.items?.forEach((i) => {
      i.tabindex = i === item ? '0' : '-1';
      i.focused = i === item && !item.activated;
    });
    this.#changeDetectorRef.detectChanges();
  }

  public moveItemUp(item: KeyboardSortItemDirective): boolean {
    if (this.items?.length) {
      const items = this.items.toArray();
      const currentPosition = items.indexOf(item);
      if (currentPosition > 0) {
        const moveToIndex = currentPosition - 1;
        if (!this.#previousIndex) {
          this.#previousIndex = currentPosition;
        }
        this.#currentIndex = moveToIndex;
        if (this.kbdSortListData) {
          moveItemInArray(this.kbdSortListData, currentPosition, moveToIndex);
          this.#changeDetectorRef.detectChanges();
        }
        setTimeout(() => {
          this.activateNthItem(moveToIndex);
        });
        return true;
      }
    }
    return false;
  }

  public moveItemDown(item: KeyboardSortItemDirective): boolean {
    if (this.items?.length) {
      const items = this.items.toArray();
      const currentPosition = items.indexOf(item);
      if (currentPosition > -1 && currentPosition < items.length - 1) {
        const moveToIndex = currentPosition + 1;
        if (!this.#previousIndex) {
          this.#previousIndex = currentPosition;
        }
        this.#currentIndex = moveToIndex;
        if (this.kbdSortListData) {
          moveItemInArray(this.kbdSortListData, currentPosition, moveToIndex);
          this.#changeDetectorRef.detectChanges();
        }
        setTimeout(() => {
          this.activateNthItem(moveToIndex);
        });
        return true;
      }
    }
    return false;
  }

  public activateNthItem(n: number): void {
    this.onNextStable(() => {
      if (this.items?.length) {
        const items = this.items.toArray();
        const item = items[n];
        if (item) {
          this.activateItem(item);
        }
      }
    });
  }

  public dropItem(item: KeyboardSortItemDirective): void {
    if (
      item.activated &&
      this.#previousIndex !== undefined &&
      this.#currentIndex !== undefined &&
      this.#previousIndex !== this.#currentIndex
    ) {
      this.kdbSortDrop.emit({
        previousIndex: this.#previousIndex,
        currentIndex: this.#currentIndex,
      });
    }
  }

  public capturePreviousIndex(item: KeyboardSortItemDirective): void {
    if (item.activated) {
      this.#previousIndex = this.items?.toArray().indexOf(item);
    }
  }

  private onNextStable(cb: () => void): void {
    this.#subscriptions.add(
      this.#appRef.isStable
        .pipe(
          filter((isStable) => isStable),
          take(1)
        )
        .subscribe(() => {
          cb();
        })
    );
  }
}
