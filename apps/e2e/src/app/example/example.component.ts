import { Component, model } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import {
  KeyboardSortItemDirective, KeyboardSortItemIfActiveDirective,
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
    FormsModule,
    KeyboardSortListDirective,
    KeyboardSortItemDirective,
    KeyboardSortItemIfActiveDirective,
    KeyboardSortItemIfFocusedDirective,
  ],
})
export class ExampleComponent {
  public readonly items = model<string[]>([
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
  ]);
  public readonly enabled = model<boolean>(true);

  public drop($event: CdkDragDrop<string[]>) {
    const items = this.items();
    moveItemInArray(items, $event.previousIndex, $event.currentIndex);
    this.items.set([...items]);
  }

  public resetData(): void {
    this.items.set(
      [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].slice(0, this.items().length + 1)
    );
  }
}

export default ExampleComponent;
