import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { KeyboardSortItemFixtureComponent } from './fixtures/keyboard-sort-item-fixture.component';

describe('ItemDirective', () => {
  let component: KeyboardSortItemFixtureComponent;
  let fixture: ComponentFixture<KeyboardSortItemFixtureComponent>;

  function setupTest(
    overrides: Partial<KeyboardSortItemFixtureComponent> = {}
  ): void {
    TestBed.configureTestingModule({
      imports: [KeyboardSortItemFixtureComponent],
    });

    fixture = TestBed.createComponent(KeyboardSortItemFixtureComponent);
    component = fixture.componentInstance;
    Object.assign(component, overrides);
    fixture.detectChanges();
  }

  it('should create an instance', async () => {
    setupTest();
    await fixture.whenStable();
    expect(component).toBeTruthy();
    const sortItem = (fixture.nativeElement as HTMLElement)
      .firstChild as HTMLElement;
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.example-active')).toBeFalsy();
    sortItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeTrue();
    expect(fixture.nativeElement.querySelector('.example-active')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.example-focus')).toBeFalsy();
    sortItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.example-active')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.example-focus')).toBeTruthy();
  });

  it('should use handles', async () => {
    setupTest({ showHandle: true });
    await fixture.whenStable();
    expect(component).toBeTruthy();
    const sortItem = (fixture.nativeElement as HTMLElement)
      .firstChild as HTMLElement;
    expect(sortItem.matches('.kbd-sort-item')).toBeTrue();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeFalse();
    const itemText = sortItem.querySelector('span');
    expect(itemText).toBeTruthy();
    itemText?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeFalse();
    const handleElement =
      fixture.nativeElement.querySelector('.example-handle');
    expect(handleElement).toBeTruthy();
    handleElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeTrue();
  });

  it('should change handles', async () => {
    setupTest({ showHandle: true });
    await fixture.whenStable();
    expect(component).toBeTruthy();
    const handleElement =
      fixture.nativeElement.querySelector('.example-handle');
    expect(handleElement).toBeTruthy();
    expect(handleElement.getAttribute('tabindex')).toBe('0');
    expect(component.item?.tabindex).toBeUndefined();
    component.showHandle = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.tabindex).toBe('0');
  });

  it('should focus on handle', fakeAsync(() => {
    setupTest({ showHandle: true });
    expect(component).toBeTruthy();
    const handleElement = fixture.nativeElement.querySelector(
      '.example-handle'
    ) as HTMLElement;
    expect(handleElement).toBeTruthy();
    component.item?.activate();
    fixture.detectChanges();
    tick();
    expect(handleElement.matches(':focus-within')).toBeTrue();
  }));

  it('should change focus', () => {
    setupTest();
    const item = component.item;
    expect(item).toBeTruthy();
    item?.activate();
    expect(item?.activated).toBeTrue();
    item?.deactivate();
    expect(item?.activated).toBeFalse();
    item?.toggleActivated();
    expect(item?.activated).toBeTrue();
    item?.toggleActivated();
    expect(item?.activated).toBeFalse();
  });

  it('should change focus with keyboard', fakeAsync(() => {
    setupTest();
    const item = component.item;
    expect(item).toBeTruthy();
    item?.ngAfterViewInit();
    expect(item?.activated).toBeFalse();
    item?.elementRef.nativeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter' })
    );
    expect(item?.activated).toBeTrue();
    expect(item?.focused).toBeFalse();
    item?.elementRef.nativeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ' })
    );
    expect(item?.activated).toBeFalse();
    expect(item?.focused).toBeTrue();
    item?.elementRef.nativeElement.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Tab' })
    );
    expect(item?.activated).toBeTrue();
    expect(item?.focused).toBeFalse();
    tick();
    expect(item?.elementRef.nativeElement.matches(':focus-within')).toBeTrue();
  }));

  it('should noop without a list', () => {
    setupTest();
    expect(component).toBeTruthy();
    expect(component.item).toBeTruthy();
    expect(component.item?.moveDown()).toBeFalse();
    expect(component.item?.moveUp()).toBeFalse();
    expect(component.item).toBeTruthy();
    if (component.item) {
      component.item.activate();
      component.item.kbdSortItemDisabled = true;
    }
    expect(component.item?.isDisabled()).toBeTrue();
  });
});
