import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TokenDetailsComponent } from './token-details.component';

const routes: Routes = [
  {
    path: ':tokenId',
    component: TokenDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenDetailsRoutingModule {}
