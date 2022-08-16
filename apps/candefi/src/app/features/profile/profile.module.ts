import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '../../shared/shared.module';
import { ListingsComponent } from './listings/listings.component';
import { RentalsComponent } from './rentals/rentals.component';
import { StorageComponent } from './storage/storage.component';
import { CardModule } from 'primeng/card';
import { EarningsComponent } from './earnings/earnings.component';

@NgModule({
  declarations: [
    ProfileComponent,
    ListingsComponent,
    RentalsComponent,
    StorageComponent,
    EarningsComponent,
  ],
  imports: [CommonModule, ProfileRoutingModule, SharedModule, CardModule],
  exports: [ProfileComponent],
})
export class ProfileModule {}
