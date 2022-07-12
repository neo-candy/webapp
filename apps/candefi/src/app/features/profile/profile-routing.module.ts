import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonitorComponent } from '../../shared/components/monitor/monitor.component';
import { ListingsComponent } from './listings/listings.component';
import { ProfileComponent } from './profile.component';
import { RentalsComponent } from './rentals/rentals.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: 'earnings',
        component: MonitorComponent,
      },
      {
        path: 'listings',
        component: ListingsComponent,
      },
      {
        path: 'rentals',
        component: RentalsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
