import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  SkipSelf,
} from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { filter, Subscription, take } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { KeyboardSortEvent } from './keyboard-sort-event';

@Directive({
  selector: '[kbdSortList]',
  exportAs: 'kbdSortList',
  standalone: true,
})
export class KeyboardSortListDirective implements AfterViewInit, OnDestroy {
  @ContentChildren(KeyboardSortItemDirective, { descendants: false })
  public items: QueryList<KeyboardSortItemDirective> | undefined;

  @Input()
  public kbdSortListOrientation: 'horizontal' | 'vertical' = 'horizontal';

  @Input()
  public kbdSortListDisabled = false;

  @Input()
  public kbdSortListData: unknown[] | undefined = [];

  @Output()
  public kdbSortEnd = new EventEmitter<KeyboardSortEvent>();

  #appRef: ApplicationRef;
  #changeDetectorRef: ChangeDetectorRef;
  #doc: Document;
  #elementRef: ElementRef;
  #subscriptions = new Subscription();

  constructor(
    readonly changeDetectorRef: ChangeDetectorRef,
    readonly appRef: ApplicationRef,
    readonly elementRef: ElementRef,
    @Inject(DOCUMENT) readonly document: Document
  ) {
    this.#changeDetectorRef = changeDetectorRef;
    this.#appRef = appRef;
    this.#elementRef = elementRef;
    this.#doc = document;
  }

  public ngAfterViewInit(): void {
    this.onNextStable(() => {
      this.items?.forEach((item) => {
        item.connectToList(this);
      });
      this.#subscriptions.add(
        this.items?.changes.subscribe(() => {
          this.items?.forEach((item) => {
            item.connectToList(this);
          });
        })
      );
    });
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
      this.items?.forEach((item) => {
        item.deactivate();
      });
      this.kdbSortEnd.emit({
        list: this,
      });
    }
  }

  @HostListener('document:keydown.Escape')
  public deactivateAll(): void {
    this.items?.forEach((item) => {
      item.deactivate();
    });
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

  public moveItemUp(item: KeyboardSortItemDirective): boolean {
    if (this.items?.length) {
      const items = this.items.toArray();
      const currentPosition = items.indexOf(item);
      if (currentPosition > 0) {
        const moveToIndex = currentPosition - 1;
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
