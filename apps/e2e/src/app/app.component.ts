import { Component, inject } from '@angular/core';
import { ROUTES, RouterLink, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterOutlet],
})
export class AppComponent {
  public routes = inject(ROUTES);
}
