import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { KeyboardSortItemService } from './keyboard-sort-item.service';

@Directive({
  selector: '[kbdSortHandle]',
  exportAs: 'kbdSortHandle',
  standalone: true,
  host: {
    '[attr.tabindex]': '"-1"',
  },
})
export class KeyboardSortHandleDirective {
  /**
   * @internal
   */
  public readonly elementRef = inject(ElementRef<HTMLElement>);

  #itemService = inject(KeyboardSortItemService, { optional: true });

  @HostListener('keydown', ['$event'])
  public handleKeydown(event: KeyboardEvent): void {
    this.#itemService?.onKeydown(event);
  }
}
