import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[kbdSortHandle]',
  exportAs: 'kbdSortHandle',
  host: {
    '[attr.tabindex]': '"-1"',
    '[attr.aria-label]': 'kbdSortHandleLabel() || null',
  },
})
export class KeyboardSortHandleDirective {
  /**
   * Accessible label for the handle. Recommended when the handle's visible
   * content (an icon, for example) doesn't already describe its purpose.
   */
  public readonly kbdSortHandleLabel = input<string>('');

  /**
   * @internal
   */
  public readonly elementRef = inject(ElementRef<HTMLElement>);
}
