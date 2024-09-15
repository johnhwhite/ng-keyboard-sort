import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { KeyboardSortListFixtureComponent } from './fixtures/keyboard-sort-list-fixture.component';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortListEmptyFixtureComponent } from './fixtures/keyboard-sort-list-empty-fixture.component';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { signal } from '@angular/core';

describe('ListDirective', () => {
  let component: KeyboardSortListFixtureComponent;
  let fixture: ComponentFixture<KeyboardSortListFixtureComponent>;
  const getItem = (index: number): KeyboardSortItemDirective => {
    return component.items?.toArray()[index] as KeyboardSortItemDirective;
  };

  function setupTest(
    componentOverrides: Partial<{
      data: string[] | undefined;
      direction: 'horizontal' | 'vertical';
      disabled: boolean;
    }> = {}
  ) {
    TestBed.configureTestingModule({
      imports: [KeyboardSortListFixtureComponent],
      providers: [KeyboardSortListService],
    });

    fixture = TestBed.createComponent(KeyboardSortListFixtureComponent);
    component = fixture.componentInstance;
    Object.entries(componentOverrides).forEach(([key, value]) => {
      fixture.componentRef.setInput(key, value);
    });
    fixture.detectChanges();
    component.items?.forEach((item) => {
      item.ngAfterViewInit();
    });
    fixture.detectChanges();
  }

  afterEach(() => {
    component?.list?.ngOnDestroy();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    setupTest();
    expect(component).toBeTruthy();
  });

  it('should change focus', async () => {
    setupTest();
    const list = component.list;
    const item = component.items?.first;
    expect(item).toBeTruthy();
    list?.activateItem(item as KeyboardSortItemDirective);
    expect(item?.activated()).toBeTrue();
    item?.deactivate();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.activated()).toBeFalse();
    const listElement = fixture.nativeElement.querySelector('ul');
    listElement.dispatchEvent(
      new FocusEvent('blur', { relatedTarget: listElement.ownerDocument.body })
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(listElement.getAttribute('tabindex')).toBe('0');
    component.activateLastItem();
    fixture.detectChanges();
    await fixture.whenStable();
    const last = component.items?.last;
    expect(last).toBeTruthy();
    expect(last?.activated()).toBeTrue();
    expect(last?.focused()).toBeFalse();
  });

  it('should change orientation', async () => {
    setupTest();
    component.direction.set('vertical');
    fixture.detectChanges();
    await fixture.whenStable();
    getItem(2).activate();
    fixture.detectChanges();
    await fixture.whenStable();
    component.direction.set('horizontal');
    fixture.detectChanges();
    await fixture.whenStable();
    getItem(2).moveUp();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(1).activated()).toBeTrue();
    getItem(1).toggleActivated();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(1).activated()).toBeFalse();
    expect(getItem(1).focused()).toBeTrue();
    expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
    component.list?.focusNextItem(getItem(2));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('li')).toHaveClass(
      'kbd-sort-item-focused'
    );
  });

  it('should disable', fakeAsync(() => {
    setupTest({
      disabled: true,
    });
    const list = component.list;
    const item = component.items?.first;
    expect(item).toBeTruthy();
    list?.activateItem(item as KeyboardSortItemDirective);
    expect(item?.activated()).toBeFalse();
    expect(
      fixture.nativeElement.querySelectorAll('[tabindex="-1"]').length
    ).toBe(3);
    expect(
      fixture.nativeElement.querySelectorAll('[tabindex="0"]').length
    ).toBe(1);
    component.disabled.set(false);
    (fixture.nativeElement as HTMLElement).ownerDocument.body.focus();
    fixture.detectChanges();
    tick();
    expect(getItem(0).focused()).toBeFalse();
    fixture.nativeElement.querySelector('ul')?.focus();
    fixture.detectChanges();
    tick();
    expect(getItem(0).focused()).toBeTrue();
    expect(component.list?.moveItemUp(getItem(0))).toBeFalse();
    expect(component.list?.moveItemUp(getItem(2))).toBeTrue();
    fixture.detectChanges();
    tick();
    component.list?.focusPreviousItem(getItem(0));
    fixture.detectChanges();
    tick();
    expect(getItem(2).focused()).toBeTrue();
  }));

  it('should move items', async () => {
    setupTest();
    expect(component.items?.length).toBe(3);
    expect(getItem(0)).toBeTruthy();
    expect(getItem(0).elementRef.nativeElement.textContent?.trim()).toBe(
      'Item 1'
    );
    (fixture.nativeElement as HTMLElement).querySelector('ul')?.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('ul')
        ?.getAttribute('tabindex')
    ).toBe('-1');
    component.list?.activateItem(getItem(0));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(0).activated()).toBeTrue();
    expect(getItem(0).moveDown()).toBeTrue();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(1).activated()).toBeTrue();
    component.list?.deactivateAll();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(1).moveDown()).toBeFalse();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(1).moveUp()).toBeFalse();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(0).elementRef.nativeElement.textContent?.trim()).toBe(
      'Item 2'
    );
    expect(getItem(1).elementRef.nativeElement.textContent?.trim()).toBe(
      'Item 1'
    );
    expect(getItem(2).elementRef.nativeElement.textContent?.trim()).toBe(
      'Item 3'
    );
    expect(getItem(0).activated()).toBeFalse();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(getItem(0).isDisabled()).toBeTrue();
  });

  ['horizontal', 'vertical'].forEach((direction) => {
    const arrows =
      direction === 'horizontal'
        ? ['ArrowRight', 'ArrowLeft']
        : ['ArrowDown', 'ArrowUp'];
    const selectKeys =
      direction === 'vertical'
        ? ['ArrowRight', 'ArrowLeft']
        : ['ArrowDown', 'ArrowUp'];

    describe(`with ${direction} orientation`, () => {
      it(`should move focus in ${direction} direction`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list).toBeTruthy();
        const lastItem = getItem(2);
        expect(lastItem).toBeTruthy();
        lastItem.onKeydown(new KeyboardEvent('keydown', { key: arrows[1] }));
        fixture.detectChanges();
        tick();
        flush();
        expect(lastItem.focused()).toBeFalse();
        const item = getItem(1);
        expect(item.focused()).toBeTrue();
        item.onKeydown(new KeyboardEvent('keydown', { key: arrows[0] }));
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(2).focused()).toBeTrue();
      }));

      it(`should move focus with arrow keys ${direction}ly`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const firstItem = fixture.componentInstance.items?.first;
        expect(firstItem).toBeTruthy();
        firstItem?.focus('keyboard');
        expect(firstItem?.activated()).toBeFalse();
        expect(firstItem?.focused()).toBeTrue();
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(0).focused()).toBeTrue();
        firstItem?.onKeydown(new KeyboardEvent('keydown', { key: arrows[0] }));
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(0).focused()).toBeFalse();
        expect(getItem(1).focused()).toBeTrue();
        const secondItem = getItem(1);
        secondItem?.onKeydown(new KeyboardEvent('keydown', { key: arrows[1] }));
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(1).focused()).toBeFalse();
        expect(getItem(0).focused()).toBeTrue();
      }));

      it(`should move item up in ${direction} direction`, async () => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list).toBeTruthy();
        const lastItem = getItem(2);
        expect(lastItem).toBeTruthy();
        lastItem.focus('keyboard');
        lastItem.onKeydown(
          new KeyboardEvent('keydown', { key: selectKeys[1] })
        );
        expect(lastItem.activated()).toBeTruthy();
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        lastItem.onKeydown(new KeyboardEvent('keydown', { key: arrows[1] }));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
        component.list?.deactivateAll();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastItem.activated()).toBeFalsy();
        expect(lastItem.focused()).toBeFalsy();
        expect(component.drops).toEqual([
          {
            previousIndex: 2,
            currentIndex: 1,
          },
        ]);
      });

      it(`should move item down in ${direction} direction`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list).toBeTruthy();
        const lastItem = getItem(0);
        expect(lastItem).toBeTruthy();
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        component.list?.moveItemDown(lastItem);
        fixture.detectChanges();
        tick();
        expect(component.data()).toEqual(['Item 2', 'Item 1', 'Item 3']);
      }));

      it(`should move item 1 down in ${direction} direction with arrow keys`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 1');
        expect(element).toHaveClass('kbd-sort-item');
        element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        tick();
        flush();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[0] })
        );
        fixture.detectChanges();
        tick();
        flush();
        expect(component.data()).toEqual(['Item 2', 'Item 1', 'Item 3']);
      }));

      it(`should move item 2 down in ${direction} direction with arrow keys`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li:nth-child(2)'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 2');
        expect(element).toHaveClass('kbd-sort-item');
        element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        tick();
        flush();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[0] })
        );
        fixture.detectChanges();
        tick();
        flush();
        expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
      }));

      it(`should move item 2 up in ${direction} direction with arrow keys`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li:nth-child(2)'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 2');
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: selectKeys[1] })
        );
        fixture.detectChanges();
        tick();
        flush();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[1] })
        );
        fixture.detectChanges();
        tick();
        flush();
        expect(component.data()).toEqual(['Item 2', 'Item 1', 'Item 3']);
        fixture.detectChanges();
        tick();
        flush();
        const activeElement = (
          fixture.nativeElement as HTMLElement
        ).querySelector('li:nth-child(1)');
        expect(activeElement).toHaveClass('kbd-sort-item-activated');
        activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', { key: selectKeys[0] })
        );
        fixture.detectChanges();
        tick();
        flush();
        expect(activeElement).not.toHaveClass('kbd-sort-item-activated');
      }));

      it(`should move item 3 up in ${direction} direction with arrow keys`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li:nth-child(3)'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 3');
        element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        tick();
        flush();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[1] })
        );
        fixture.detectChanges();
        tick();
        flush();
        expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
      }));
    });
  });

  it('should deal with bad data', () => {
    setupTest({
      data: undefined,
    });
    expect(component.items?.length).toBe(0);
    expect(
      component.list?.moveItemDown({
        position: signal(1),
      } as unknown as KeyboardSortItemDirective)
    ).toBeFalse();
    expect(
      component.list?.moveItemUp({
        position: signal(1),
      } as unknown as KeyboardSortItemDirective)
    ).toBeFalse();
    component.data.set(['One']);
    fixture.detectChanges();
  });

  it('should deal with empty list', () => {
    TestBed.configureTestingModule({
      imports: [KeyboardSortListEmptyFixtureComponent],
    });
    const fixture = TestBed.createComponent(
      KeyboardSortListEmptyFixtureComponent
    );
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    fixture.detectChanges();
    expect(component.list).toBeTruthy();
    component.list?.focusPreviousItem({
      position: signal(1),
    } as unknown as KeyboardSortItemDirective);
    expect(
      component.list?.moveItemDown({
        position: signal(1),
      } as unknown as KeyboardSortItemDirective)
    ).toBeFalse();
    expect(
      component.list?.moveItemUp({
        position: signal(1),
      } as unknown as KeyboardSortItemDirective)
    ).toBeFalse();
  });
});
