import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketRoutingModule } from './market-routing.module';
import { MarketComponent } from './market.component';
import { SharedModule } from '../../shared/shared.module';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { MarketDetailsComponent } from './market-details/market-details.component';
import { RentDetailsComponent } from './market-details/rent-details/rent-details.component';

@NgModule({
  declarations: [MarketComponent, MarketDetailsComponent, RentDetailsComponent],
  imports: [
    CommonModule,
    MarketRoutingModule,
    SharedModule,
    DynamicDialogModule,
  ],
})
export class MarketModule {}
