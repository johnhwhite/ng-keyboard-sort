import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
} from '@angular/core';
import { KeyboardSortItemService } from './keyboard-sort-item.service';

@Directive({
  selector: '[kbdSortHandle]',
  exportAs: 'kbdSortHandle',
  standalone: true,
})
export class KeyboardSortHandleDirective {
  @HostBinding('attr.tabindex')
  public tabindex = '-1';

  public readonly elementRef = inject(ElementRef<HTMLElement>);

  #itemService = inject(KeyboardSortItemService, { optional: true });

  @HostListener('keydown', ['$event'])
  public handleKeydown(event: KeyboardEvent): void {
    this.#itemService?.onKeydown(event);
  }
}
