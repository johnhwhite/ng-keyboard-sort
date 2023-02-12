import { KeyboardSortItemIfActiveDirective } from './keyboard-sort-item-if-active.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardSortItemFixtureComponent } from './fixtures/keyboard-sort-item-fixture.component';

describe('KeyboardSortItemIfActiveDirective', () => {
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
  });
});
