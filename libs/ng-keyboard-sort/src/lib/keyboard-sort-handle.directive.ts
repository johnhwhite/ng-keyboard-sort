import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[kbdSortHandle]',
  exportAs: 'kbdSortHandle',
  host: {
    '[attr.tabindex]': '"-1"',
  },
})
export class KeyboardSortHandleDirective {
  /**
   * @internal
   */
  public readonly elementRef = inject(ElementRef<HTMLElement>);
}
