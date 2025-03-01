import {
  Directive,
  effect,
  inject,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { KeyboardSortItemService } from './keyboard-sort-item.service';

@Directive({
  selector: '[kbdSortKeyboardSortItemIfActive]',
})
export class KeyboardSortItemIfActiveDirective {
  #hasView = false;
  readonly #item = inject(KeyboardSortItemService).item;
  readonly #templateRef = inject(TemplateRef) as TemplateRef<unknown>;
  readonly #viewContainer = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const shouldShow = !!this.#item()?.activated();
      if (shouldShow && !this.#hasView) {
        this.#viewContainer.createEmbeddedView(this.#templateRef);
        this.#hasView = true;
      } else if (!shouldShow && this.#hasView) {
        this.#viewContainer.clear();
        this.#hasView = false;
      }
    });
  }
}
