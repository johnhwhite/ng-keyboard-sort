import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { KeyboardSortListFixtureComponent } from './fixtures/keyboard-sort-list-fixture.component';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';
import { KeyboardSortListEmptyFixtureComponent } from './fixtures/keyboard-sort-list-empty-fixture.component';
import { KeyboardSortService } from './keyboard-sort.service';

describe('ListDirective', () => {
  let component: KeyboardSortListFixtureComponent;
  let fixture: ComponentFixture<KeyboardSortListFixtureComponent>;
  const getItem = (index: number): KeyboardSortItemDirective => {
    return component.items?.toArray()[index] as KeyboardSortItemDirective;
  };

  function setupTest(
    componentOverrides: Partial<KeyboardSortListFixtureComponent> = {}
  ) {
    TestBed.configureTestingModule({
      imports: [KeyboardSortListFixtureComponent],
      providers: [KeyboardSortService],
    });

    fixture = TestBed.createComponent(KeyboardSortListFixtureComponent);
    component = fixture.componentInstance;
    Object.assign(component, componentOverrides);
    fixture.detectChanges();
    component.items?.forEach((item) => {
      item.ngAfterViewInit();
    });
    fixture.detectChanges();
  }

  it('should create an instance', () => {
    setupTest();
    expect(component).toBeTruthy();
  });

  it('should change focus', () => {
    setupTest();
    const list = component.list;
    const item = component.items?.first;
    expect(item).toBeTruthy();
    list?.activateItem(item as KeyboardSortItemDirective);
    expect(item?.activated).toBeTrue();
    item?.deactivate();
    expect(item?.activated).toBeFalse();
  });

  it('should move items', async () => {
    setupTest();
    expect(component.items?.length).toBe(3);
    expect(getItem(0)).toBeTruthy();
    expect(getItem(0).elementRef.nativeElement.textContent?.trim()).toBe(
      'Item 1'
    );
    getItem(0).activate();
    expect(getItem(0).moveDown()).toBeTrue();
    getItem(1).deactivate();
    expect(getItem(1).moveDown()).toBeFalse();
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
    component.list?.deactivateAll();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(getItem(0).activated).toBeFalse();
    if (component.list) {
      component.list.kbdSortListDisabled = true;
    }
    expect(getItem(0).isDisabled()).toBeTrue();
  });

  ['horizontal', 'vertical'].forEach((direction) => {
    const arrows =
      direction === 'horizontal'
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
        component.list?.activatePreviousItem(lastItem);
        fixture.detectChanges();
        tick();
        expect(
          lastItem.elementRef.nativeElement.matches(':focus-within')
        ).toBeFalse();
        expect(
          getItem(1).elementRef.nativeElement.matches(':focus-within')
        ).toBeTrue();
        component.list?.activateNextItem(getItem(1));
        fixture.detectChanges();
        tick();
        expect(
          getItem(2).elementRef.nativeElement.matches(':focus-within')
        ).toBeTrue();
      }));

      it(`should move focus with arrow keys ${direction}ly`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const firstItem = (fixture.nativeElement as HTMLElement).querySelector(
          'li'
        );
        expect(firstItem).toBeTruthy();
        expect(firstItem?.matches('[tabindex]')).toBeTrue();
        firstItem?.focus();
        firstItem?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[0] })
        );
        fixture.detectChanges();
        tick();
        expect(
          getItem(0).elementRef.nativeElement.matches(':focus-within')
        ).toBeFalse();
        expect(
          getItem(1).elementRef.nativeElement.matches(':focus-within')
        ).toBeTrue();
        const list = (fixture.nativeElement as HTMLElement).querySelector('ul');
        list?.dispatchEvent(new KeyboardEvent('keydown', { key: arrows[1] }));
        fixture.detectChanges();
        tick();
        expect(
          getItem(1).elementRef.nativeElement.matches(':focus-within')
        ).toBeFalse();
        expect(
          getItem(0).elementRef.nativeElement.matches(':focus-within')
        ).toBeTrue();
      }));

      it(`should move item up in ${direction} direction`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        const dropSpy = jasmine.createSpy('dropSpy');
        component.list?.kdbSortDrop.subscribe(dropSpy);
        expect(component.list).toBeTruthy();
        const lastItem = getItem(2);
        expect(lastItem).toBeTruthy();
        expect(component.data).toEqual(['Item 1', 'Item 2', 'Item 3']);
        component.list?.moveItemUp(lastItem);
        fixture.detectChanges();
        tick();
        expect(component.data).toEqual(['Item 1', 'Item 3', 'Item 2']);
        expect(dropSpy).toHaveBeenCalledTimes(1);
        expect(dropSpy).toHaveBeenCalledWith({
          previousIndex: 2,
          currentIndex: 1,
        });
      }));

      it(`should move item down in ${direction} direction`, fakeAsync(() => {
        setupTest({
          direction: direction as 'horizontal' | 'vertical',
        });
        expect(component.list).toBeTruthy();
        const lastItem = getItem(0);
        expect(lastItem).toBeTruthy();
        expect(component.data).toEqual(['Item 1', 'Item 2', 'Item 3']);
        component.list?.moveItemDown(lastItem);
        fixture.detectChanges();
        tick();
        expect(component.data).toEqual(['Item 2', 'Item 1', 'Item 3']);
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
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[0] })
        );
        fixture.detectChanges();
        tick();
        expect(component.data).toEqual(['Item 2', 'Item 1', 'Item 3']);
        const activeElement = (
          fixture.nativeElement as HTMLElement
        ).querySelector('li:nth-child(2)');
        expect(activeElement).toHaveClass('kbd-sort-item-activated');
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
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[0] })
        );
        fixture.detectChanges();
        tick();
        expect(component.data).toEqual(['Item 1', 'Item 3', 'Item 2']);
        const activeElement = (
          fixture.nativeElement as HTMLElement
        ).querySelector('li:nth-child(3)');
        expect(activeElement).toHaveClass('kbd-sort-item-activated');
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
        element?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fixture.detectChanges();
        tick();
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[1] })
        );
        fixture.detectChanges();
        tick();
        expect(component.data).toEqual(['Item 2', 'Item 1', 'Item 3']);
        const activeElement = (
          fixture.nativeElement as HTMLElement
        ).querySelector('li:nth-child(1)');
        fixture.detectChanges();
        tick();
        expect(activeElement).toHaveClass('kbd-sort-item-activated');
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
        expect(element).toHaveClass('kbd-sort-item-activated');
        expect(component.data).toEqual(['Item 1', 'Item 2', 'Item 3']);
        element?.dispatchEvent(
          new KeyboardEvent('keydown', { key: arrows[1] })
        );
        fixture.detectChanges();
        tick();
        expect(component.data).toEqual(['Item 1', 'Item 3', 'Item 2']);
        const activeElement = (
          fixture.nativeElement as HTMLElement
        ).querySelector('li:nth-child(2)');
        expect(activeElement).toHaveClass('kbd-sort-item-activated');
        expect(element?.textContent?.trim()).toBe('Item 3  Active');
      }));
    });
  });

  it('should deal with bad data', () => {
    setupTest({
      data: undefined,
    });
    expect(component.items?.length).toBe(0);
    expect(
      component.list?.moveItemDown({} as KeyboardSortItemDirective)
    ).toBeFalse();
    expect(
      component.list?.moveItemUp({} as KeyboardSortItemDirective)
    ).toBeFalse();
    component.list?.activateNextItem({} as KeyboardSortItemDirective);
    component.list?.activatePreviousItem({} as KeyboardSortItemDirective);
    component.data = ['One'];
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
    expect(
      component.list?.moveItemDown({} as KeyboardSortItemDirective)
    ).toBeFalse();
    expect(
      component.list?.moveItemUp({} as KeyboardSortItemDirective)
    ).toBeFalse();
    component.list?.activateNextItem({} as KeyboardSortItemDirective);
    component.list?.activatePreviousItem({} as KeyboardSortItemDirective);
  });
});
