import { Component, model } from '@angular/core';
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
  public items = model<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);

  public drop($event: CdkDragDrop<string[]>) {
    const items = this.items();
    moveItemInArray(items, $event.previousIndex, $event.currentIndex);
    this.items.set([...items]);
  }
}

export default ExampleComponent;
