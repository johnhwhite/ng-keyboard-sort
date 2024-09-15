import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ExampleWithHandlesComponent,
  Item,
} from './example-with-handles.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';

describe('ExampleWithHandlesComponent', () => {
  let component: ExampleWithHandlesComponent;
  let fixture: ComponentFixture<ExampleWithHandlesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CdkDrag,
        CdkDropList,
        CdkDragPlaceholder,
        ExampleWithHandlesComponent,
      ],
    });

    fixture = TestBed.createComponent(ExampleWithHandlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should move items up and down', () => {
    const items = component.items;
    const firstItem = items()[0];
    const secondItem = items()[1];
    const event = {
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<Item[]>;
    component.drop(event);
    expect(items()[0]).toEqual(secondItem);
    expect(items()[1]).toEqual(firstItem);
  });
});
