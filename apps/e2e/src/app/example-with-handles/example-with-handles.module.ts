import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDrag,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { KeyboardSortModule } from 'ng-keyboard-sort';

import { ExampleWithHandlesRoutingModule } from './example-with-handles-routing.module';
import { ExampleWithHandlesComponent } from './example-with-handles.component';

@NgModule({
  declarations: [ExampleWithHandlesComponent],
  imports: [
    CommonModule,
    ExampleWithHandlesRoutingModule,
    CdkDrag,
    CdkDropList,
    KeyboardSortModule,
    CdkDragPlaceholder,
  ],
})
export class ExampleWithHandlesModule {}
