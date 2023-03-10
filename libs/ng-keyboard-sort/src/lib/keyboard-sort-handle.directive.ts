import { Directive, ElementRef, HostBinding } from '@angular/core';

@Directive({
  selector: '[kbdSortHandle]',
  exportAs: 'kbdSortHandle',
  standalone: true,
})
export class KeyboardSortHandleDirective {
  @HostBinding('attr.tabindex')
  public tabindex = '-1';

  constructor(public readonly elementRef: ElementRef<HTMLElement>) {}
}
