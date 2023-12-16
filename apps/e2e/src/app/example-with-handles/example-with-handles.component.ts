import { Component } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NgFor } from '@angular/common';
import {
  KeyboardSortHandleDirective,
  KeyboardSortItemDirective,
  KeyboardSortItemIfActiveDirective,
  KeyboardSortItemIfFocusedDirective,
  KeyboardSortListDirective,
} from 'ng-keyboard-sort';

@Component({
  selector: 'app-example-with-handles',
  templateUrl: './example-with-handles.component.html',
  styleUrls: ['./example-with-handles.component.css'],
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    KeyboardSortHandleDirective,
    KeyboardSortItemDirective,
    KeyboardSortItemIfActiveDirective,
    KeyboardSortItemIfFocusedDirective,
    KeyboardSortListDirective,
    NgFor,
  ],
})
export class ExampleWithHandlesComponent {
  public items: string[] = [
    'Dog 1',
    'Dog 2',
    'Dog 3',
    'Dog 4',
    'Dog 5',
    'Dog 6',
    'Dog 7',
    'Dog 8',
  ];

  public drop($event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, $event.previousIndex, $event.currentIndex);
  }
}

export default ExampleWithHandlesComponent;
