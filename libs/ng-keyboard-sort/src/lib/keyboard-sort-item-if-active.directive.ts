import {
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';

@Directive({
  selector: '[kbdSortKeyboardSortItemIfActive]',
})
export class KeyboardSortItemIfActiveDirective {
  #view: EmbeddedViewRef<unknown> | undefined;
  readonly #item = inject(KeyboardSortItemDirective);
  readonly #templateRef = inject(TemplateRef) as TemplateRef<unknown>;
  readonly #viewContainer = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const shouldShow = this.#item.activated();
      if (shouldShow && !this.#view) {
        this.#view = this.#viewContainer.createEmbeddedView(this.#templateRef);
        this.#item.registerProjectedView(this.#view);
      } else if (!shouldShow && this.#view) {
        this.#item.unregisterProjectedView(this.#view);
        this.#viewContainer.clear();
        this.#view = undefined;
      }
    });
  }
}
