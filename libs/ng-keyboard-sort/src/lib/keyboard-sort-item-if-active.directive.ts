import {
  AfterViewInit,
  Directive,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { KeyboardSortItemService } from './keyboard-sort-item.service';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[kbdSortKeyboardSortItemIfActive]',
  standalone: true,
})
export class KeyboardSortItemIfActiveDirective
  implements AfterViewInit, OnDestroy
{
  #hasView = false;
  #item: KeyboardSortItemDirective | undefined;
  readonly #subscription = new Subscription();
  readonly #templateRef: TemplateRef<unknown>;
  readonly #viewContainer: ViewContainerRef;

  constructor(
    templateRef: TemplateRef<unknown>,
    viewContainer: ViewContainerRef,
    keyboardSortItemService: KeyboardSortItemService
  ) {
    this.#templateRef = templateRef;
    this.#viewContainer = viewContainer;
    this.#item = keyboardSortItemService.item;
  }

  ngAfterViewInit(): void {
    this.#updateView();
    if (this.#item) {
      this.#subscription.add(
        this.#item.kbdSortItemActivated.subscribe(() => this.#updateView())
      );
    }
  }

  ngOnDestroy(): void {
    this.#subscription.unsubscribe();
  }

  #updateView(): void {
    const shouldShow = this.#item?.activated && !this.#item?.isDisabled();
    if (shouldShow && !this.#hasView) {
      this.#viewContainer.createEmbeddedView(this.#templateRef);
      this.#hasView = true;
    } else if (!shouldShow && this.#hasView) {
      this.#viewContainer.clear();
      this.#hasView = false;
    }
  }
}
