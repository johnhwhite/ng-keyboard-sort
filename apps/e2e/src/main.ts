import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routes';
import { provideRouter } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserModule), provideRouter(routes)],
}).catch((err) => console.error(err));
