import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'example',
    title: 'Example',
    loadComponent: () => import('./example/example.component'),
  },
  {
    path: 'example-with-handles',
    title: 'Example with handles',
    loadComponent: () =>
      import('./example-with-handles/example-with-handles.component'),
  },
  { path: '', redirectTo: 'example', pathMatch: 'full' },
];
