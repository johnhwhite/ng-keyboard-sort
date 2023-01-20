import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'example',
    loadChildren: () =>
      import('./example/example.module').then((m) => m.ExampleModule),
  },
  {
    path: 'example-with-handles',
    loadChildren: () =>
      import('./example-with-handles/example-with-handles.module').then(
        (m) => m.ExampleWithHandlesModule
      ),
  },
  { path: '', redirectTo: 'example', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
