import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KeyboardSortListFixtureComponent } from './fixtures/keyboard-sort-list-fixture.component';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortListDirective } from './keyboard-sort-list.directive';
import { KeyboardSortListEmptyFixtureComponent } from './fixtures/keyboard-sort-list-empty-fixture.component';
import { KeyboardSortListService } from './keyboard-sort-list.service';
import { signal } from '@angular/core';

describe('ListDirective', () => {
  const getItem = (
    fixture: ComponentFixture<KeyboardSortListFixtureComponent>,
    index: number
  ): KeyboardSortItemDirective => {
    return fixture.componentInstance.items()[
      index
    ] as KeyboardSortItemDirective;
  };

  function setupTest(
    componentOverrides: Partial<{
      data: string[] | undefined;
      direction: 'horizontal' | 'vertical';
      disabled: boolean;
    }> = {}
  ): {
    fixture: ComponentFixture<KeyboardSortListFixtureComponent>;
    component: KeyboardSortListFixtureComponent;
  } {
    TestBed.configureTestingModule({
      imports: [KeyboardSortListFixtureComponent],
      providers: [KeyboardSortListService],
    });

    const fixture = TestBed.createComponent(KeyboardSortListFixtureComponent);
    const component = fixture.componentInstance;
    Object.entries(componentOverrides).forEach(([key, value]) => {
      fixture.componentRef.setInput(key, value);
    });
    fixture.detectChanges();

    return { fixture, component };
  }

  it('should create an instance', () => {
    const { component } = setupTest();
    expect(component).toBeTruthy();
  });

  it('should change focus', async () => {
    const { fixture, component } = setupTest();
    const list = component.list();
    list?.activateItem(0);
    const item = component.items()[0];
    expect(item?.activated()).toBeTrue();
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.activated()).toBeFalse();
    fixture.debugElement
      .query(By.directive(KeyboardSortListDirective))
      .triggerEventHandler(
        'focusout',
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    const listElement = fixture.nativeElement.querySelector('ul');
    expect(listElement.getAttribute('tabindex')).toBe('0');
    component.activateLastItem();
    fixture.detectChanges();
    await fixture.whenStable();
    const last = component.items().slice().pop();
    expect(last).toBeTruthy();
    expect(last?.activated()).toBeTrue();
    expect(last?.focused()).toBeFalse();
  });

  it('should change orientation', async () => {
    const { fixture, component } = setupTest();
    component.direction.set('vertical');
    fixture.detectChanges();
    await fixture.whenStable();
    getItem(fixture, 2).activate();
    fixture.detectChanges();
    await fixture.whenStable();
    component.direction.set('horizontal');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement
      .queryAll(By.directive(KeyboardSortItemDirective))[2]
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(fixture, 1).activated()).toBeTrue();
    fixture.debugElement
      .queryAll(By.directive(KeyboardSortItemDirective))[1]
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(fixture, 1).activated()).toBeFalse();
    expect(getItem(fixture, 1).focused()).toBeTrue();
    expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
    component.list()?.focusNextItem(getItem(fixture, 2));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('li')).toHaveClass(
      'kbd-sort-item-focused'
    );
  });

  it('should disable', fakeAsync(() => {
    const { fixture, component } = setupTest({
      disabled: true,
    });
    const list = component.list();
    const item = component.items()[0];
    expect(item).toBeTruthy();
    list?.activateItem(item as KeyboardSortItemDirective);
    expect(item?.activated()).toBeFalse();
    expect(
      fixture.nativeElement.querySelectorAll('[tabindex="-1"]').length
    ).toBe(4);
    expect(
      fixture.nativeElement.querySelectorAll('[tabindex="0"]').length
    ).toBe(0);
    component.disabled.set(false);
    expect(getItem(fixture, 0).focused()).toBeTrue();
    component.list()?.deactivateAll();
    fixture.detectChanges();
    tick();
    expect(getItem(fixture, 0).disabled).toBeFalse();
    expect(getItem(fixture, 0).focused()).toBeFalse();
    component.list()?.focusFirstItem();
    fixture.detectChanges();
    tick();
    expect(getItem(fixture, 0).focused()).toBeTrue();
    expect(component.list()?.moveItemUp(getItem(fixture, 0))).toBeFalse();
    expect(component.list()?.moveItemUp(getItem(fixture, 2))).toBeTrue();
    fixture.detectChanges();
    tick();
    getItem(fixture, 0).focus('keyboard');
    component.list()?.focusPreviousItem(getItem(fixture, 0));
    fixture.detectChanges();
    tick();
    expect(getItem(fixture, 2).focused()).toBeTrue();
  }));

  it('should move items', async () => {
    const { fixture, component } = setupTest();
    expect(component.items()?.length).toBe(3);
    expect(getItem(fixture, 0)).toBeTruthy();
    expect(
      getItem(fixture, 0).elementRef.nativeElement.textContent?.trim()
    ).toBe('Item 1');
    fixture.debugElement
      .query(By.directive(KeyboardSortListDirective))
      .triggerEventHandler('focusin');
    fixture.debugElement
      .query(By.directive(KeyboardSortListDirective))
      .triggerEventHandler('focus');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('ul')
        ?.getAttribute('tabindex')
    ).toBe('-1');
    component.list()?.activateItem(getItem(fixture, 0));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(fixture, 0).activated()).toBeTrue();
    expect(
      getItem(fixture, 0).elementRef.nativeElement.textContent?.trim()
    ).toBe('Item 1  Active');
    fixture.debugElement
      .queryAll(By.directive(KeyboardSortItemDirective))[0]
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(fixture, 1).activated()).toBeTrue();
    component.list()?.deactivateAll();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement
      .queryAll(By.directive(KeyboardSortItemDirective))[1]
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'ArrowRight' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement
      .queryAll(By.directive(KeyboardSortItemDirective))[1]
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(
      getItem(fixture, 0).elementRef.nativeElement.textContent?.trim()
    ).toBe('Item 2');
    expect(
      getItem(fixture, 1).elementRef.nativeElement.textContent?.trim()
    ).toBe('Item 1');
    expect(
      getItem(fixture, 2).elementRef.nativeElement.textContent?.trim()
    ).toBe('Item 3');
    expect(getItem(fixture, 0).activated()).toBeFalse();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(getItem(fixture, 0).isDisabled()).toBeTrue();
  });

  ['horizontal', 'vertical'].forEach((direction) => {
    const arrows =
      direction === 'horizontal'
        ? ['ArrowRight', 'ArrowLeft']
        : ['ArrowDown', 'ArrowUp'];
    const selectKeys =
      direction === 'vertical' ? ['x', 'e'] : ['ArrowDown', 'ArrowUp'];
    const startEndKeys =
      direction === 'vertical' ? ['PageUp', 'PageDown'] : ['Home', 'End'];

    describe(`with ${direction} orientation`, () => {
      it(`should move focus in ${direction} direction`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list()).toBeTruthy();
        getItem(fixture, 2).focus('keyboard');
        expect(getItem(fixture, 2).focused()).toBeTrue();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[1] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(fixture, 2).focused()).toBeFalse();
        expect(getItem(fixture, 1).focused()).toBeTrue();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[1]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[0] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(fixture, 2).focused()).toBeTrue();
      }));

      it(`should move focus with arrow keys ${direction}ly`, fakeAsync(() => {
        const { fixture } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const firstItem = fixture.componentInstance.items()[0];
        expect(firstItem).toBeTruthy();
        firstItem?.focus('keyboard');
        expect(firstItem?.activated()).toBeFalse();
        expect(firstItem?.focused()).toBeTrue();
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(fixture, 0).focused()).toBeTrue();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[0]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[0] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(fixture, 0).focused()).toBeFalse();
        expect(getItem(fixture, 1).focused()).toBeTrue();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[1]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[1] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(getItem(fixture, 1).focused()).toBeFalse();
        expect(getItem(fixture, 0).focused()).toBeTrue();
      }));

      it(`should move item up in ${direction} direction`, async () => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list()).toBeTruthy();
        const lastItem = getItem(fixture, 2);
        expect(lastItem).toBeTruthy();
        lastItem.focus('keyboard');
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: selectKeys[1] })
          );
        expect(lastItem.activated()).toBeTruthy();
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[1] })
          );
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
        component.list()?.deactivateAll();
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

      it(`should move item up two steps in ${direction} direction`, async () => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list()).toBeTruthy();
        const lastItem = getItem(fixture, 2);
        expect(lastItem).toBeTruthy();
        lastItem.focus('keyboard');
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: selectKeys[1] })
          );
        expect(lastItem.activated()).toBeTrue();
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[1] })
          );
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[1]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[1] })
          );
        fixture.detectChanges();
        await fixture.whenStable();
        expect(component.data()).toEqual(['Item 3', 'Item 1', 'Item 2']);
        component.list()?.deactivateAll();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastItem.activated()).toBeFalse();
        expect(lastItem.focused()).toBeFalse();
        expect(component.drops).toEqual([
          {
            previousIndex: 2,
            currentIndex: 0,
          },
        ]);
      });

      it(`should move item down in ${direction} direction`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list()).toBeTruthy();
        const lastItem = getItem(fixture, 0);
        expect(lastItem).toBeTruthy();
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        component.list()?.moveItemDown(lastItem);
        fixture.detectChanges();
        tick();
        expect(component.data()).toEqual(['Item 2', 'Item 1', 'Item 3']);
      }));

      it(`should move item 1 down in ${direction} direction with arrow keys`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 1');
        expect(element).toHaveClass('kbd-sort-item');
        component.list()?.focusFirstItem();
        fixture.debugElement
          .query(By.directive(KeyboardSortItemDirective))
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: 'Enter' })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        fixture.debugElement
          .query(By.directive(KeyboardSortItemDirective))
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[0] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(component.data()).toEqual(['Item 2', 'Item 1', 'Item 3']);
      }));

      it(`should move item 2 down in ${direction} direction with arrow keys`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li:nth-child(2)'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 2');
        expect(element).toHaveClass('kbd-sort-item');
        component.list()?.focusItem(1);
        element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        tick();
        flush();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[1]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[0] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(component.data()).toEqual(['Item 1', 'Item 3', 'Item 2']);
      }));

      it(`should move item 2 up in ${direction} direction with arrow keys`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li:nth-child(2)'
        );
        expect(element).toBeTruthy();
        component.list()?.focusItem(1);
        fixture.detectChanges();
        expect(element?.textContent?.trim()).toBe('Item 2  Focused');
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[1]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: selectKeys[1] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[1]
          .triggerEventHandler(
            'keydown',
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
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[0]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: selectKeys[0] })
          );
        fixture.detectChanges();
        tick();
        flush();
        expect(activeElement).not.toHaveClass('kbd-sort-item-activated');
      }));

      it(`should move item 3 up in ${direction} direction with arrow keys`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li:nth-child(3)'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 3');
        component.list()?.focusItem(2);
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

      it(`should move item 3 up two steps in ${direction} direction with arrow keys`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const element = (fixture.nativeElement as HTMLElement).querySelector(
          'li:nth-child(3)'
        );
        expect(element).toBeTruthy();
        expect(element?.textContent?.trim()).toBe('Item 3');
        component.list()?.activateItem(2);
        fixture.detectChanges();
        tick();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[1] })
          );
        fixture.detectChanges();
        tick();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[1]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[1] })
          );
        fixture.detectChanges();
        tick();
        expect(component.data()).toEqual(['Item 3', 'Item 1', 'Item 2']);
        component.list()?.deactivateAll();
        fixture.detectChanges();
        tick();
        expect(getItem(fixture, 0).activated()).toBeFalse();
        expect(component.drops).toEqual([
          {
            previousIndex: 2,
            currentIndex: 0,
          },
        ]);
        component.list()?.focusFirstItem();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[0]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: 'Enter' })
          );
        fixture.detectChanges();
        tick();
        expect(getItem(fixture, 0).activated()).toBeTrue();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[0]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: arrows[0] })
          );
        fixture.detectChanges();
        tick();
        (fixture.nativeElement as HTMLElement)
          .querySelector('li:nth-child(2)')
          ?.dispatchEvent(new KeyboardEvent('keydown', { key: arrows[0] }));
        fixture.detectChanges();
        tick();
        expect(component.data()).toEqual(['Item 1', 'Item 2', 'Item 3']);
        (fixture.nativeElement as HTMLElement)
          .querySelector('li:nth-child(3)')
          ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        tick();
        expect(component.drops).toEqual([
          {
            previousIndex: 2,
            currentIndex: 0,
          },
          {
            previousIndex: 0,
            currentIndex: 2,
          },
        ]);
      }));

      it(`should skip to start and end positions in ${direction} direction with ${startEndKeys.join('/')} keys`, fakeAsync(() => {
        const { fixture, component } = setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        component.list()?.focusFirstItem();
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[0]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: startEndKeys[1] })
          );
        fixture.detectChanges();
        expect(component.currentFocus()).toBe(2);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: 'Enter' })
          );
        fixture.detectChanges();
        expect(component.currentActive()).toBe(2);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: startEndKeys[0] })
          );
        fixture.detectChanges();
        expect(component.currentActive()).toBe(0);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[0]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: startEndKeys[1] })
          );
        fixture.detectChanges();
        expect(component.currentActive()).toBe(2);
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: 'Enter' })
          );
        fixture.debugElement
          .queryAll(By.directive(KeyboardSortItemDirective))[2]
          .triggerEventHandler(
            'keydown',
            new KeyboardEvent('keydown', { key: startEndKeys[0] })
          );
        fixture.detectChanges();
        expect(component.currentFocus()).toBe(0);
      }));
    });
  });

  it('should deal with bad data', () => {
    const { fixture, component } = setupTest({
      data: undefined,
    });
    expect(component.items?.length).toBe(0);
    expect(
      component.list()?.moveItemDown({
        position: signal(1),
      } as unknown as KeyboardSortItemDirective)
    ).toBeFalse();
    expect(
      component.list()?.moveItemUp({
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
    expect(component.list()).toBeTruthy();
    component.list()?.focusPreviousItem({
      position: signal(1),
    } as unknown as KeyboardSortItemDirective);
    expect(
      component.list()?.moveItemDown({
        position: signal(1),
      } as unknown as KeyboardSortItemDirective)
    ).toBeFalse();
    expect(
      component.list()?.moveItemUp({
        position: signal(1),
      } as unknown as KeyboardSortItemDirective)
    ).toBeFalse();
  });
});
