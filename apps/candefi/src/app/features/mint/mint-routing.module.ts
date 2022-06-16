import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MintComponent } from './mint.component';

const routes: Routes = [
  {
    path: '',
    component: MintComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MintRoutingModule {}
