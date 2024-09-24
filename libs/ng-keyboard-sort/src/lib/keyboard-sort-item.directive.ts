import {
  AfterViewInit,
  computed,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyboardSortHandleDirective } from './keyboard-sort-handle.directive';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { KeyboardSortItemService } from './keyboard-sort-item.service';
import { FocusableOption, FocusOrigin } from '@angular/cdk/a11y';

const directionalKeys = {
  up: ['ArrowUp', 'W', 'w'],
  down: ['ArrowDown', 'S', 's'],
  left: ['ArrowLeft', 'A', 'a'],
  right: ['ArrowRight', 'D', 'd'],
};

@Directive({
  selector: '[kbdSortItem]',
  exportAs: 'kbdSortItem',
  standalone: true,
  host: {
    '[attr.tabindex]': '"-1"',
    '[class.kbd-sort-item]': 'true',
    '[class.kbd-sort-item-disabled]': 'kbdSortItemDisabled()',
    '[class.kbd-sort-item-enabled]': '!kbdSortItemDisabled()',
    '[class.kbd-sort-item-activated]': 'activated()',
    '[class.kbd-sort-item-focused]': 'focused()',
  },
  providers: [KeyboardSortItemService],
})
export class KeyboardSortItemDirective
  implements AfterViewInit, OnDestroy, FocusableOption
{
  public readonly handles = contentChildren(KeyboardSortHandleDirective);

  public position = input.required<number>({
    alias: 'kbdSortItem',
  });
  public readonly activated = model<boolean>(false);
  /**
   * @internal
   */
  public readonly focused = signal<boolean>(false);
  public readonly kbdSortItemDisabled = model<boolean>(false);

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
    const listDisabled = !!this.#list?.kbdSortListDisabled();
    return itemDisabled || listDisabled;
  });

  readonly #list = inject(KeyboardSortListService).list;
  readonly #itemService = inject(KeyboardSortItemService, { self: true });
  readonly #subscriptions = new Subscription();

  constructor() {
    this.#itemService.item = this;
    effect(
      () => {
        const itemDisabled = this.kbdSortItemDisabled();
        const isActivated = this.activated();
        if (itemDisabled && isActivated) {
          this.activated.set(false);
        }
      },
      { allowSignalWrites: true }
    );
    effect(
      () => {
        const activated = this.activated();
        const focused = this.focused();
        if (activated && focused) {
          this.focused.set(false);
        }
        this.kbdSortItemActivated.emit(activated);
        this.kbdSortItemFocused.emit(focused);
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  public ngAfterViewInit(): void {
    if (this.activated()) {
      this.activated.set(true);
    }
  }

  public ngOnDestroy(): void {
    this.#subscriptions.unsubscribe();
  }

  public focus(origin?: FocusOrigin): void {
    if (['keyboard', 'program'].includes(origin || '')) {
      if (!this.activated()) {
        this.focused.set(true);
      }
      if (!this.elementRef.nativeElement.matches(':focus-within')) {
        if (this.handles()[0]) {
          this.handles()[0].elementRef.nativeElement.focus();
        } else {
          this.elementRef.nativeElement.focus();
        }
      }
    }
  }

  @HostListener('focusout')
  public onFocusOut(): void {
    if (this.activated()) {
      this.deactivate();
    } else if (this.focused()) {
      this.focused.set(false);
    }
  }

  @HostListener('keydown', ['$event'])
  public onKeydown($event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    if ($event.key === 'Enter' || $event.key === ' ') {
      $event.preventDefault();
      $event.stopPropagation();
      this.toggleActivated();
      return;
    }
    if (
      [
        ...directionalKeys.up,
        ...directionalKeys.down,
        ...directionalKeys.left,
        ...directionalKeys.right,
      ].includes($event.key)
    ) {
      $event.preventDefault();
      $event.stopPropagation();

      const kbdSortListOrientation = this.#list?.kbdSortListOrientation();
      const directionalCommands = {
        moveUp:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.up
            : directionalKeys.left,
        moveDown:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.down
            : directionalKeys.right,
        pickUp:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.left
            : directionalKeys.up,
        putDown:
          kbdSortListOrientation === 'vertical'
            ? directionalKeys.right
            : directionalKeys.down,
      };

      if (directionalCommands.moveUp.includes($event.key)) {
        if (this.activated()) {
          this.moveUp();
        } else {
          this.#list?.focusPreviousItem(this);
        }
      } else if (directionalCommands.moveDown.includes($event.key)) {
        if (this.activated()) {
          this.moveDown();
        } else {
          this.#list?.focusNextItem(this);
        }
      } else if (
        !this.activated() &&
        directionalCommands.pickUp.includes($event.key)
      ) {
        this.activate();
      } else if (
        this.activated() &&
        directionalCommands.putDown.includes($event.key)
      ) {
        this.deactivate();
        this.focus('keyboard');
      }
    }
  }

  public toggleActivated() {
    if (this.activated()) {
      this.deactivate();
      this.focused.set(true);
    } else {
      this.activate();
    }
  }

  public activate() {
    if (!this.activated() && !this.isDisabled()) {
      this.#list?.deactivateAll(this.position());
      this.activated.set(true);
    }
  }

  public deactivate() {
    if (this.activated) {
      this.activated.set(false);
    }
  }

  public moveUp(): boolean {
    if (!this.#list) {
      return false;
    }
    if (this.activated() && !this.isDisabled()) {
      return this.#list.moveItemUp(this);
    }
    return false;
  }

  public moveDown(): boolean {
    if (!this.#list) {
      return false;
    }
    if (this.activated() && !this.isDisabled()) {
      return this.#list.moveItemDown(this);
    }
    return false;
  }
}
