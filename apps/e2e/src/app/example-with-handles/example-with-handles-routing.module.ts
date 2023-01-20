import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExampleWithHandlesComponent } from './example-with-handles.component';

const routes: Routes = [{ path: '', component: ExampleWithHandlesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExampleWithHandlesRoutingModule {}
