import { describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KeyboardSortItemFixtureComponent } from './fixtures/keyboard-sort-item-fixture.component';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';

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
    expect(component.item()).toBeTruthy();
    const sortItem = (fixture.nativeElement as HTMLElement)
      .firstChild as HTMLElement;
    expect(sortItem.matches('.kbd-sort-item-activated')).toBeFalsy();
    expect(component.active()).toBeFalsy();
    component.item()?.focus('keyboard');
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBe(true);
    expect(component.item()?.activated()).toBeTruthy();
    expect(component.item()?.focused()).toBeFalsy();
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.item()?.activated()).toBeFalsy();
    expect(component.item()?.focused()).toBeTruthy();
  });

  it('should use handles', async () => {
    setupTest({ showHandle: true });
    await fixture.whenStable();
    expect(component).toBeTruthy();
    const sortItem = (fixture.nativeElement as HTMLElement)
      .firstChild as HTMLElement;
    expect(sortItem.matches('.kbd-sort-item')).toBe(true);
    expect(sortItem.matches('.kbd-sort-item-activated')).toBe(false);
    component.item()?.focus('keyboard');
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBe(true);
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(sortItem.matches('.kbd-sort-item-activated')).toBe(false);
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
    const item = component.item();
    expect(item?.elementRef.nativeElement).toBeTruthy();
    item?.focus('keyboard');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.focused()).toBe(true);
    item?.activate();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.focused()).toBe(false);
  });

  it('should change focus', async () => {
    setupTest();
    const item = component.item();
    expect(item).toBeTruthy();
    expect(item?.activated()).toBe(false);
    if (item) {
      item.focused.set(true);
      item.activate();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.focused()).toBe(false);
      expect(item.activated()).toBe(true);
      fixture.debugElement
        .query(By.directive(KeyboardSortItemDirective))
        .triggerEventHandler('focusout');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.activated()).toBe(false);
      fixture.debugElement
        .query(By.directive(KeyboardSortItemDirective))
        .triggerEventHandler(
          'keydown',
          new KeyboardEvent('keydown', { key: 'Enter' })
        );
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.activated()).toBe(true);
      fixture.debugElement
        .query(By.directive(KeyboardSortItemDirective))
        .triggerEventHandler(
          'keydown',
          new KeyboardEvent('keydown', { key: 'Enter' })
        );
      fixture.detectChanges();
      await fixture.whenStable();
      expect(item.activated()).toBe(false);
    } else {
      throw new Error();
    }
  });

  it('should change focus with keyboard', async () => {
    setupTest();
    const item = component.item();
    expect(item).toBeTruthy();
    expect(item?.activated()).toBe(false);
    item?.focus('keyboard');
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    expect(item?.activated()).toBe(true);
    expect(item?.focused()).toBe(false);
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: ' ' })
      );
    expect(item?.activated()).toBe(false);
    expect(item?.focused()).toBe(true);
  });

  it('should noop without a list', async () => {
    setupTest();
    expect(component).toBeTruthy();
    expect(component.item()).toBeTruthy();
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'ArrowDown' })
      );
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'ArrowUp' })
      );
    expect(component.item()).toBeTruthy();
    const item = component.item();
    if (item) {
      item.activate();
      component.disabled.set(true);
      fixture.detectChanges();
    }
    expect(item?.isDisabled()).toBe(true);
  });

  it('should noop when disabled', async () => {
    setupTest();
    expect(component).toBeTruthy();
    expect(component.item()).toBeTruthy();
    const item = component.item();
    if (item) {
      item.disabled = true;
    }
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.isDisabled()).toBe(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler(
        'keydown',
        new KeyboardEvent('keydown', { key: 'Enter' })
      );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.activated()).toBe(false);
  });

  it('should handle initially activated', async () => {
    setupTest({
      activated: true,
    });
    expect(component).toBeTruthy();
    expect(component.item()).toBeTruthy();
    const item = component.item();
    expect(item?.activated()).toBe(true);
    item?.focus();
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler('focusout');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.activated()).toBe(false);
    item?.focus('keyboard');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.focused()).toBe(true);
    fixture.debugElement
      .query(By.directive(KeyboardSortItemDirective))
      .triggerEventHandler('focusout');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.focused()).toBe(false);
    component.activated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    component.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(item?.isDisabled()).toBe(true);
  });
});
