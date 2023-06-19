import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css'],
})
export class ExampleComponent {
  public items: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  public drop($event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, $event.previousIndex, $event.currentIndex);
  }

  protected trackByFn = (_: number, item: string) => item;
}
