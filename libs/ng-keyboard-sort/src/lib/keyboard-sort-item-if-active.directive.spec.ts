import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { KeyboardSortItemIfActiveDirective } from 'ng-keyboard-sort';
import { KeyboardSortItemService } from './keyboard-sort-item.service';

@Component({
  selector: 'kbd-sort-test-component',
  template: ` <div *kbdSortKeyboardSortItemIfActive></div> `,
  imports: [KeyboardSortItemIfActiveDirective],
})
class TestComponent {}

describe('KeyboardSortItemIfActiveDirective', () => {
  it('should show and hide', async () => {
    const activated = signal(false);
    const isDisabled = signal(false);
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        {
          provide: KeyboardSortItemService,
          useValue: { item: signal({ activated, isDisabled }) },
        },
      ],
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div')).toBeFalsy();
    activated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div')).toBeTruthy();
    activated.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div')).toBeFalsy();
  });
});
