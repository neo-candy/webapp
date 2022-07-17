import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { GlobalState, GLOBAL_RX_STATE } from './state/global.state';
import { RxState } from '@rx-angular/state';
import { FooterComponent } from './footer/footer.component';
import { MenuModule } from './menu/menu.module';

@NgModule({
  declarations: [AppComponent, FooterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastModule,
    AppRoutingModule,
    SharedModule,
    MenuModule,
  ],
  providers: [
    MessageService,
    {
      provide: GLOBAL_RX_STATE,
      useFactory: () => new RxState<GlobalState>(),
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
