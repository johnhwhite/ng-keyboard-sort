import {
  AfterViewInit,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
} from '@angular/core';
import { concatWith, of, Subscription } from 'rxjs';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { KeyboardSortItemService } from './keyboard-sort-item.service';
import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';

@Directive({
  selector: '[kbdSortItem]',
  exportAs: 'kbdSortItem',
  standalone: true,
  host: {
    '[class.kbd-sort-item]': 'true',
    '[class.kbd-sort-item-disabled]': 'kbdSortItemDisabled',
    '[class.kbd-sort-item-enabled]': '!kbdSortItemDisabled',
    '[class.kbd-sort-item-activated]': 'activated',
    '[class.kbd-sort-item-focused]': 'focused',
  },
  providers: [
    {
      provide: KeyboardSortItemService,
      useFactory: () => new KeyboardSortItemService(),
    },
  ],
})
export class KeyboardSortItemDirective
  implements AfterViewInit, OnDestroy, FocusableOption
{
  @ContentChildren(KeyboardSortHandleDirective)
  public handles: QueryList<KeyboardSortHandleDirective> | undefined;

  @Input({ alias: 'kbdSortItem', required: true })
  public position = -1;

  @Input()
  public get activated(): boolean {
    return this.#activated;
  }
  public set activated(value: boolean) {
    if (value && this.focused) {
      this.focused = false;
    }
    this.#activated = value;
    this.list?.capturePreviousIndex(this);
    this.kbdSortItemActivated.emit(value);
  }

  public get focused(): boolean {
    return this.#focused;
  }
  public set focused(value: boolean) {
    if (this.#focused !== value) {
      this.#focused = value;
      this.kbdSortItemFocused.emit(value);
    }
  }

  @HostBinding('attr.tabindex')
  public readonly tabindex = '-1' as const;

  @Input()
  public get kbdSortItemDisabled(): boolean {
    return this.#kbdSortItemDisabled;
  }
  public set kbdSortItemDisabled(value: boolean) {
    if (value && this.activated) {
      this.activated = false;
    }
    this.#kbdSortItemDisabled = value;
  }

  public get disabled(): boolean {
    return this.kbdSortItemDisabled;
  }
  public set disabled(value: boolean) {
    this.kbdSortItemDisabled = value;
  }

  @Output()
  public kbdSortItemActivated = new EventEmitter<boolean>();

  @Output()
  public kbdSortItemFocused = new EventEmitter<boolean>();

  public readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly list = inject(KeyboardSortListService).list;
  readonly #itemService = inject(KeyboardSortItemService, { self: true });
  readonly #subscriptions = new Subscription();
  #kbdSortItemDisabled = false;
  #activated = false;
  #focused = false;
  #hasHandles = false;

  constructor() {
    this.#itemService.item = this;
  }

  public ngAfterViewInit(): void {
    if (this.activated) {
      this.activated = true;
    }
    if (this.handles) {
      this.#subscriptions.add(
        of(this.handles)
          .pipe(concatWith(this.handles.changes))
          .subscribe((handles: QueryList<KeyboardSortHandleDirective>) => {
            this.#hasHandles = handles.length > 0;
          })
      );
    }
  }

  public ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }

  public focus(origin?: FocusOrigin): void {
    if (['keyboard', 'program'].includes(origin || '')) {
      if (!this.activated) {
        this.focused = true;
      }
      if (!this.elementRef.nativeElement.matches(':focus-within')) {
        if (this.handles?.first) {
          this.handles.first.elementRef.nativeElement.focus();
        } else {
          this.elementRef.nativeElement.focus();
        }
      }
    }
  }

  @HostListener('focusout')
  public onFocusOut(): void {
    if (this.activated) {
      this.deactivate();
    } else if (this.focused) {
      this.focused = false;
    }
  }

  @HostListener('keydown', ['$event'])
  public onKeydown($event: KeyboardEvent): void {
    this.#itemService?.onKeydown($event);
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
      this.list?.deactivateAll();
      this.activated = true;
    }
  }

  public deactivate() {
    if (this.activated) {
      this.activated = false;
    }
  }

  public isDisabled(): boolean {
    if (this.kbdSortItemDisabled) {
      return true;
    }
    return !!this.list?.kbdSortListDisabled;
  }

  public moveUp(): boolean {
    if (!this.list) {
      return false;
    }
    if (this.activated && !this.isDisabled()) {
      return this.list.moveItemUp(this);
    }
    return false;
  }

  public moveDown(): boolean {
    if (!this.list) {
      return false;
    }
    if (this.activated && !this.isDisabled()) {
      return this.list.moveItemDown(this);
    }
    return false;
  }
}
