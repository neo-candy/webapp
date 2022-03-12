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
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';

import { AppComponent } from './app.component';
import { NftDetailsComponent } from './nft-details/nft-details.component';
import { TruncateAddressPipe } from './pipes/truncateAddress.pipe';
import { FormsModule } from '@angular/forms';
import { NgxAnimatedCounterComponent } from './ngx-animated-counter/ngx-animated-counter.component';

@NgModule({
  declarations: [
    AppComponent,
    NftDetailsComponent,
    TruncateAddressPipe,
    NgxAnimatedCounterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ButtonModule,
    MenubarModule,
    TabViewModule, //required to use ng-template in primeng components,
    RippleModule,
    TableModule,
    TagModule,
    MenuModule,
    DialogModule,
    FormsModule,
    SliderModule,
    ScrollPanelModule,
    DropdownModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
