import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-example-with-handles',
  templateUrl: './example-with-handles.component.html',
  styleUrls: ['./example-with-handles.component.css'],
})
export class ExampleWithHandlesComponent {
  public items: string[] = [
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
    'Item 5',
    'Item 6',
    'Item 7',
    'Item 8',
  ];

  public drop($event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, $event.previousIndex, $event.currentIndex);
  }

  protected trackByFn = (_: number, item: string) => item;
}
