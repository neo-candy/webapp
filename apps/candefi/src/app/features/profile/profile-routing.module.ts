import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StorageComponent } from './storage/storage.component';
import { ListingsComponent } from './listings/listings.component';
import { ProfileComponent } from './profile.component';
import { RentalsComponent } from './rentals/rentals.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: 'storage',
        component: StorageComponent,
      },
      {
        path: 'listings',
        component: ListingsComponent,
      },
      {
        path: 'rentings',
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
