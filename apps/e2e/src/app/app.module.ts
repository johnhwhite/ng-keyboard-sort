import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoggerPanelComponent } from './logger-panel/logger-panel.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, LoggerPanelComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
