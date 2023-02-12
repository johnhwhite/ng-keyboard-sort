import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
  SkipSelf,
} from '@angular/core';
import { filter, fromEvent, Subscription, take } from 'rxjs';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { KeyboardSortService } from './keyboard-sort.service';
import { KeyboardSortItemService } from './keyboard-sort-item.service';

@Directive({
  selector: '[kbdSortItem]',
  exportAs: 'kbdSortItem',
  standalone: true,
  host: {
    '[attr.tabindex]': 'tabindex',
    '[class.kbd-sort-item]': 'true',
    '[class.kbd-sort-item-disabled]': 'kbdSortItemDisabled',
    '[class.kbd-sort-item-enabled]': '!kbdSortItemDisabled',
  },
  providers: [
    {
      provide: KeyboardSortItemService,
      useFactory: () => new KeyboardSortItemService(),
    },
  ],
})
export class KeyboardSortItemDirective implements AfterViewInit, OnDestroy {
  @ContentChildren(KeyboardSortHandleDirective)
  public handles: QueryList<KeyboardSortHandleDirective> | undefined;

  @Input()
  public get activated(): boolean {
    return this.#activated;
  }
  public set activated(value: boolean) {
    if (value && this.focused) {
      this.focused = false;
    }
    this.#activated = value;
    this.kbdSortItemActivated.emit(value);
  }

  public get focused(): boolean {
    return this.#focused;
  }
  public set focused(value: boolean) {
    this.#focused = value;
    this.kbdSortItemFocused.emit(value);
  }

  public tabindex: '0' | undefined = '0';

  @Input()
  public get kbdSortItemDisabled(): boolean {
    return this.#kbdSortItemDisabled;
  }
  public set kbdSortItemDisabled(value: boolean) {
    if (value && this.activated) {
      this.activated = false;
    }
    this.#kbdSortItemDisabled = value;
    this.kbdSortItemActivated.emit(!value);
  }

  @Output()
  public kbdSortItemActivated = new EventEmitter<boolean>();

  @Output()
  public kbdSortItemFocused = new EventEmitter<boolean>();

  readonly #list: KeyboardSortListDirective | undefined;
  #subscriptions = new Subscription();
  #events = new Subscription();
  #appRef: ApplicationRef;
  #changeDetectorRef: ChangeDetectorRef;
  #doc: Document;
  #platform: Platform;
  #renderer: Renderer2;
  #kbdSortItemDisabled = false;
  #activated = false;
  #focused = false;

  constructor(
    readonly renderer: Renderer2,
    @SkipSelf() readonly changeDetectorRef: ChangeDetectorRef,
    public readonly elementRef: ElementRef<HTMLElement>,
    readonly appRef: ApplicationRef,
    readonly platform: Platform,
    @Inject(DOCUMENT) readonly document: Document,
    readonly keyboardSortService: KeyboardSortService,
    readonly keyboardSortItemService: KeyboardSortItemService
  ) {
    this.#renderer = renderer;
    this.#appRef = appRef;
    this.#changeDetectorRef = changeDetectorRef;
    this.#platform = platform;
    this.#doc = document;
    this.#list = keyboardSortService.list;
    keyboardSortItemService.item = this;
  }

  public ngAfterViewInit(): void {
    this.onNextStable(() => {
      this.updateEvents();
      this.#subscriptions.add(
        this.handles?.changes.subscribe(() => {
          this.updateEvents();
        })
      );
    });
  }

  public ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }

  public toggleActivated() {
    if (this.activated) {
      this.deactivate();
      this.focused = true;
    } else {
      this.activate();
    }
  }

  public activate() {
    if (!this.activated && !this.isDisabled()) {
      this.#list?.clearActivated();
      this.activated = true;
      this.#renderer.addClass(
        this.elementRef.nativeElement,
        'kbd-sort-item-activated'
      );
      this.#changeDetectorRef.detectChanges();
      this.focusOnHandle();
      this.kbdSortItemActivated.emit(true);
    }
  }

  public deactivate() {
    if (this.activated) {
      this.activated = false;
      this.#renderer.removeClass(
        this.elementRef.nativeElement,
        'kbd-sort-item-activated'
      );
      this.#changeDetectorRef.detectChanges();
    }
  }

  public isDisabled(): boolean {
    if (this.kbdSortItemDisabled) {
      return true;
    }
    return !!this.#list?.kbdSortListDisabled;
  }

  public moveUp(): boolean {
    if (!this.#list) {
      return false;
    }
    if (this.activated && !this.isDisabled()) {
      return this.#list.moveItemUp(this);
    }
    return false;
  }

  public moveDown(): boolean {
    if (!this.#list) {
      return false;
    }
    if (this.activated && !this.isDisabled()) {
      return this.#list.moveItemDown(this);
    }
    return false;
  }

  public focusOnHandle() {
    if (!this.activated) {
      this.focused = true;
    }
    this.onNextStable(() => {
      if (this.#platform.isBrowser) {
        setTimeout(() => {
          if (this.tabindex === '0') {
            this.elementRef.nativeElement.focus();
          } else {
            if (
              !this.handles?.some((handle) =>
                handle.elementRef.nativeElement.matches(':focus-within')
              )
            ) {
              this.handles?.first.elementRef.nativeElement.focus();
            }
          }
        });
      }
    });
  }

  private handleEvents(elementRef: ElementRef<HTMLElement>): void {
    this.#events.add(
      fromEvent<KeyboardEvent>(elementRef.nativeElement, 'keydown')
        .pipe(
          filter((event) => {
            return event.key === 'Enter' || event.key === ' ';
          })
        )
        .subscribe((event) => {
          event.preventDefault();
          event.stopPropagation();
          this.toggleActivated();
        })
    );
    this.#events.add(
      fromEvent<KeyboardEvent>(elementRef.nativeElement, 'keyup')
        .pipe(filter((event) => event.key === 'Tab'))
        .subscribe(() => {
          this.activate();
        })
    );
    this.#events.add(
      fromEvent<KeyboardEvent>(elementRef.nativeElement, 'keydown')
        .pipe(
          filter((event) => {
            return !this.isDisabled() && event.key.startsWith('Arrow');
          })
        )
        .subscribe((event) => {
          if (this.#list?.kbdSortListOrientation === 'vertical') {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              if (this.activated) {
                this.moveUp();
              } else {
                this.#list.activatePreviousItem(this);
              }
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (this.activated) {
                this.moveDown();
              } else {
                this.#list.activateNextItem(this);
              }
            }
          } else if (this.#list?.kbdSortListOrientation === 'horizontal') {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              if (this.activated) {
                this.moveUp();
              } else {
                this.#list.activatePreviousItem(this);
              }
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              if (this.activated) {
                this.moveDown();
              } else {
                this.#list.activateNextItem(this);
              }
            }
          }
        })
    );
    if (this.#platform.isBrowser) {
      this.#events.add(
        fromEvent(elementRef.nativeElement, 'blur').subscribe(() => {
          setTimeout(() => {
            if (
              this.#doc.activeElement &&
              !this.elementRef.nativeElement.contains(this.#doc.activeElement)
            ) {
              if (this.activated) {
                this.deactivate();
              }
              this.kbdSortItemFocused.emit(false);
            }
          });
        })
      );
    }
  }

  private updateEvents() {
    this.#events.unsubscribe();
    this.#events = new Subscription();
    if (this.handles?.length) {
      this.tabindex = undefined;
      this.handles.forEach((handle) => {
        this.handleEvents(handle.elementRef);
      });
    } else {
      this.tabindex = '0';
      this.handleEvents(this.elementRef);
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
