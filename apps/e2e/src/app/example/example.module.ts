import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDrag,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { KeyboardSortModule } from 'ng-keyboard-sort';

import { ExampleRoutingModule } from './example-routing.module';
import { ExampleComponent } from './example.component';

@NgModule({
  declarations: [ExampleComponent],
  imports: [
    CommonModule,
    ExampleRoutingModule,
    CdkDrag,
    CdkDropList,
    KeyboardSortModule,
    CdkDragPlaceholder,
  ],
})
export class ExampleModule {}
