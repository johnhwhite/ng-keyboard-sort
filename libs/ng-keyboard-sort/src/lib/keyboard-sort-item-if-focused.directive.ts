import {
  AfterViewInit,
  Directive,
  inject,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { KeyboardSortItemService } from './keyboard-sort-item.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[kbdSortKeyboardSortItemIfFocused]',
  standalone: true,
})
export class KeyboardSortItemIfFocusedDirective
  implements AfterViewInit, OnDestroy
{
  #hasView = false;
  readonly #item = inject(KeyboardSortItemService).item;
  readonly #subscription = new Subscription();
  readonly #templateRef = inject(TemplateRef) as TemplateRef<unknown>;
  readonly #viewContainer = inject(ViewContainerRef);

  public ngAfterViewInit(): void {
    this.#updateView();
    if (this.#item) {
      this.#subscription.add(
        this.#item.kbdSortItemFocused.subscribe(() => this.#updateView())
      );
    }
  }

  public ngOnDestroy(): void {
    this.#subscription.unsubscribe();
  }

  #updateView(): void {
    const shouldShow = this.#item?.focused && !this.#item?.isDisabled();
    if (shouldShow && !this.#hasView) {
      this.#viewContainer.createEmbeddedView(this.#templateRef);
      this.#hasView = true;
    } else if (!shouldShow && this.#hasView) {
      this.#viewContainer.clear();
      this.#hasView = false;
    }
  }
}
