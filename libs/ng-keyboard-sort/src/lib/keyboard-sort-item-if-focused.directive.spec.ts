import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { KeyboardSortItemIfFocusedDirective } from 'ng-keyboard-sort';
import { KeyboardSortItemService } from './keyboard-sort-item.service';
import { Subject } from 'rxjs';
import createSpy = jasmine.createSpy;

@Component({
  standalone: true,
  selector: 'kbd-sort-test-component',
  template: ` <div *kbdSortKeyboardSortItemIfFocused></div> `,
  imports: [KeyboardSortItemIfFocusedDirective],
})
class TestComponent {}

describe('KeyboardSortItemIfFocusedDirective', () => {
  it('should show and hide', async () => {
    const focused = createSpy('focused').and.returnValue(true);
    const isDisabled = createSpy('isDisabled').and.returnValue(false);
    const kbdSortItemFocused = new Subject<void>();
    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        {
          provide: KeyboardSortItemService,
          useValue: { item: { focused, isDisabled, kbdSortItemFocused } },
        },
      ],
    });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    kbdSortItemFocused.next();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('div')).toBeTruthy();
  });
});
