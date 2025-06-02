import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ROUTES } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterLink, RouterOutlet],
})
export class AppComponent {
  public routes = inject(ROUTES);
}
