import { Component, inject } from '@angular/core';
import { ROUTES } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public routes = inject(ROUTES);
}
