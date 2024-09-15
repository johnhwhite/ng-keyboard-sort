import { Component, model } from '@angular/core';
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

export type Item = {
  name: string;
  placeholder: string;
};

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
  public readonly items = model<Item[]>([
    { name: 'Happy', placeholder: '😀' },
    { name: 'Dopey', placeholder: '😵‍💫' },
    { name: 'Sneezy', placeholder: '🤧' },
    { name: 'Bashful', placeholder: '🫣' },
    { name: 'Sleepy', placeholder: '😴' },
    { name: 'Grumpy', placeholder: '😠' },
    { name: 'Doc', placeholder: '🤓' },
  ]);

  public drop($event: CdkDragDrop<Item[]>): void {
    const items = this.items();
    moveItemInArray(items, $event.previousIndex, $event.currentIndex);
    this.items.set([...items]);
  }
}

export default ExampleWithHandlesComponent;
