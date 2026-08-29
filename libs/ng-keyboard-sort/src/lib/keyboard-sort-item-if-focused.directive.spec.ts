import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { KeyboardSortItemIfFocusedDirective } from 'ng-keyboard-sort';
import { KeyboardSortItemDirective } from './keyboard-sort-item.directive';

@Component({
  selector: 'kbd-sort-test-component',
  template: ` <div *kbdSortKeyboardSortItemIfFocused></div> `,
  imports: [KeyboardSortItemIfFocusedDirective],
})
class TestComponent {}

describe('KeyboardSortItemIfFocusedDirective', () => {
  it('should show and hide', async () => {
    const focused = signal(false);
    const isDisabled = signal(false);
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        {
          provide: KeyboardSortItemDirective,
          useValue: {
            focused,
            isDisabled,
            registerProjectedView: () => undefined,
            unregisterProjectedView: () => undefined,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div')).toBeFalsy();
    focused.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div')).toBeTruthy();
    focused.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div')).toBeFalsy();
  });
});
