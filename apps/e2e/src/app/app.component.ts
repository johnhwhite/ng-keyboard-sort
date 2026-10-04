import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterOutlet, ROUTES } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.theme-light]': 'theme() === "light"',
    '[class.theme-dark]': 'theme() === "dark"',
    '(keydown.escape)': 'menuOpen.set(false)',
  },
})
export class AppComponent {
  public routes = inject(ROUTES);

  protected readonly theme = signal<'light' | 'dark' | undefined>(undefined);

  protected readonly menuOpen = signal(false);
}
