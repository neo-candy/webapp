import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { TabViewModule } from 'primeng/tabview';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ButtonModule,
    MenubarModule,
    TabViewModule, //required to use ng-template in primeng components,
    RippleModule,
    TableModule,
    MenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
