import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardSortHandleFixtureComponent } from './fixtures/keyboard-sort-handle-fixture.component';

describe('HandleDirective', () => {
  let component: KeyboardSortHandleFixtureComponent;
  let fixture: ComponentFixture<KeyboardSortHandleFixtureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KeyboardSortHandleFixtureComponent],
    });

    fixture = TestBed.createComponent(KeyboardSortHandleFixtureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});
