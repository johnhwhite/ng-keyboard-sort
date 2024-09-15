import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { KeyboardSortItemFixtureComponent } from './fixtures/keyboard-sort-item-fixture.component';

describe('ItemDirective', () => {
  let component: KeyboardSortItemFixtureComponent;
  let fixture: ComponentFixture<KeyboardSortItemFixtureComponent>;

  function setupTest(
    overrides: Partial<{
      activated: boolean;
      showHandle: boolean;
      disabled: boolean;
    }> = {}
  ): void {
    TestBed.configureTestingModule({
      imports: [KeyboardSortItemFixtureComponent],
    });

    fixture = TestBed.createComponent(KeyboardSortItemFixtureComponent);
    component = fixture.componentInstance;
    Object.entries(overrides).forEach(([key, value]) => {
      fixture.componentRef.setInput(key, value);
    });
    fixture.detectChanges();
  }

  it('should create an instance', async () => {
    setupTest();
    await fixture.whenStable();
    expect(component.item).toBeTruthy();
    const sortItem = (fixture.nativeElement as HTMLElement)
      .firstChild as HTMLElement;
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeFalsy();
    expect(component.active).toBeFalsy();
    component.item?.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeTrue();
    expect(component.item?.activated()).toBeTruthy();
    expect(component.item?.focused()).toBeFalsy();
    component.item?.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.activated()).toBeFalsy();
    expect(component.item?.focused()).toBeTruthy();
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
    expect(handleElement.getAttribute('tabindex')).toBe('-1');
  });

  it('should focus on handle', async () => {
    setupTest({ showHandle: true });
    expect(component).toBeTruthy();
    const handleElement = fixture.nativeElement.querySelector(
      '.example-handle'
    ) as HTMLElement;
    expect(handleElement).toBeTruthy();
    expect(component.item?.elementRef.nativeElement).toBeTruthy();
    component.item?.focus('keyboard');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.focused()).toBeTrue();
    component.item?.activate();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.focused()).toBeFalse();
  });

  it('should change focus', async () => {
    setupTest();
    const item = component.item;
    expect(item).toBeTruthy();
    expect(item?.activated()).toBeFalse();
    if (item) {
      item.focused.set(true);
      item.activate();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.focused()).toBeFalse();
      expect(item.activated()).toBeTrue();
      item.deactivate();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.activated()).toBeFalse();
      item.toggleActivated();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.activated()).toBeTrue();
      item.toggleActivated();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.activated()).toBeFalse();
    } else {
      fail();
    }
  });

  it('should change focus with keyboard', fakeAsync(() => {
    setupTest();
    const item = component.item;
    expect(item).toBeTruthy();
    item?.ngAfterViewInit();
    expect(item?.activated()).toBeFalse();
    item?.elementRef.nativeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter' })
    );
    expect(item?.activated()).toBeTrue();
    expect(item?.focused()).toBeFalse();
    item?.elementRef.nativeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ' })
    );
    expect(item?.activated()).toBeFalse();
    expect(item?.focused()).toBeTrue();
  }));

  it('should noop without a list', async () => {
    setupTest();
    expect(component).toBeTruthy();
    expect(component.item).toBeTruthy();
    expect(component.item?.moveDown()).toBeFalse();
    expect(component.item?.moveUp()).toBeFalse();
    expect(component.item).toBeTruthy();
    if (component.item) {
      component.item.activate();
      component.disabled.set(true);
      fixture.detectChanges();
    }
    expect(component.item?.isDisabled()).toBeTrue();
  });

  it('should noop when disabled', async () => {
    setupTest();
    expect(component).toBeTruthy();
    expect(component.item).toBeTruthy();
    if (component.item) {
      component.item.disabled = true;
    }
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.isDisabled()).toBeTrue();
    fixture.detectChanges();
    await fixture.whenStable();
    component.item?.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.activated()).toBeFalse();
  });

  it('should handle initially activated', async () => {
    setupTest({
      activated: true,
    });
    expect(component).toBeTruthy();
    expect(component.item).toBeTruthy();
    expect(component.item?.activated()).toBeTrue();
    component.item?.focus();
    component.item?.onFocusOut();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.activated()).toBeFalse();
    component.item?.focus('keyboard');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.focused()).toBeTrue();
    component.item?.onFocusOut();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.focused()).toBeFalse();
    component.activated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    component.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item?.isDisabled()).toBeTrue();
  });
});
