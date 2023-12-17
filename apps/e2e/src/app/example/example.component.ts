import { Component } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { NgFor } from '@angular/common';
import {
  KeyboardSortItemDirective,
  KeyboardSortItemIfActiveDirective,
  KeyboardSortItemIfFocusedDirective,
  KeyboardSortListDirective,
} from 'ng-keyboard-sort';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css'],
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortItemIfActiveDirective,
    KeyboardSortItemIfFocusedDirective,
    NgFor,
  ],
})
export class ExampleComponent {
  public items: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  public drop($event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, $event.previousIndex, $event.currentIndex);
  }
}

export default ExampleComponent;
