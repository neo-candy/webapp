import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedModule } from '../../shared/shared.module';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ListingsComponent } from './listings/listings.component';
import { ToolbarModule } from 'primeng/toolbar';

@NgModule({
  declarations: [ProfileComponent, ListingsComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    TabViewModule,
    BadgeModule,
    MenuModule,
    ConfirmDialogModule,
    ToolbarModule,
  ],
  exports: [ProfileComponent],
})
export class ProfileModule {}
