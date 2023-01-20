import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleWithHandlesComponent } from './example-with-handles.component';
import { KeyboardSortModule } from 'ng-keyboard-sort';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';

describe('ExampleWithHandlesComponent', () => {
  let component: ExampleWithHandlesComponent;
  let fixture: ComponentFixture<ExampleWithHandlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExampleWithHandlesComponent],
      imports: [CdkDrag, CdkDropList, KeyboardSortModule, CdkDragPlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleWithHandlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should move items up and down', () => {
    const items = component.items;
    const firstItem = items[0];
    const secondItem = items[1];
    const event = {
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<string[]>;
    component.drop(event);
    expect(items[0]).toEqual(secondItem);
    expect(items[1]).toEqual(firstItem);
  });
});
