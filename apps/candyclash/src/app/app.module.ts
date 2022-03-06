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
import { DialogModule } from 'primeng/dialog';
import { SliderModule } from 'primeng/slider';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { AppComponent } from './app.component';
import { NftDetailsComponent } from './nft-details/nft-details.component';
import { TruncateAddressPipe } from './pipes/truncateAddress.pipe';
import { FormsModule } from '@angular/forms';
import { NgxAnimatedCounterModule } from '@bugsplat/ngx-animated-counter';

@NgModule({
  declarations: [AppComponent, NftDetailsComponent, TruncateAddressPipe],
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
    DialogModule,
    FormsModule,
    SliderModule,
    ScrollPanelModule,
    NgxAnimatedCounterModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}