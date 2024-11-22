import { Component } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  KeyboardSortHandleDirective,
  KeyboardSortItemDirective,
  KeyboardSortItemIfActiveDirective,
  KeyboardSortItemIfFocusedDirective,
  KeyboardSortListDirective,
} from 'ng-keyboard-sort';

export interface Item {
  name: string;
  placeholder: string;
}

@Component({
  selector: 'app-example-with-handles',
  templateUrl: './example-with-handles.component.html',
  styleUrls: ['./example-with-handles.component.css'],
  imports: [
    CdkDrag,
    CdkDropList,
    KeyboardSortHandleDirective,
    KeyboardSortItemDirective,
    KeyboardSortItemIfActiveDirective,
    KeyboardSortItemIfFocusedDirective,
    KeyboardSortListDirective,
  ],
})
export class ExampleWithHandlesComponent {
  public items: Item[] = [
    { name: 'Happy', placeholder: '😀' },
    { name: 'Dopey', placeholder: '😵‍💫' },
    { name: 'Sneezy', placeholder: '🤧' },
    { name: 'Bashful', placeholder: '🫣' },
    { name: 'Sleepy', placeholder: '😴' },
    { name: 'Grumpy', placeholder: '😠' },
    { name: 'Doc', placeholder: '🤓' },
  ];

  public drop($event: CdkDragDrop<Item[]>): void {
    moveItemInArray(this.items, $event.previousIndex, $event.currentIndex);
  }
}

export default ExampleWithHandlesComponent;
