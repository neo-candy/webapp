import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '../../shared/shared.module';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ListingsComponent } from './listings/listings.component';
import { RentalsComponent } from './rentals/rentals.component';

@NgModule({
  declarations: [ProfileComponent, ListingsComponent, RentalsComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    TabViewModule,
    MenuModule,
    ConfirmDialogModule,
  ],
  exports: [ProfileComponent],
})
export class ProfileModule {}
