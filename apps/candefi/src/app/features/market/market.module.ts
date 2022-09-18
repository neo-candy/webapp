import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketRoutingModule } from './market-routing.module';
import { MarketComponent } from './market.component';
import { SharedModule } from '../../shared/shared.module';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { MarketDetailsComponent } from './market-details/market-details.component';

@NgModule({
  declarations: [MarketComponent, MarketDetailsComponent],
  imports: [
    CommonModule,
    MarketRoutingModule,
    SharedModule,
    DynamicDialogModule,
  ],
})
export class MarketModule {}
