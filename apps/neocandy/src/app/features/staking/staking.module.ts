import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { StakingComponent } from './staking.component';
import { StakingRoutingModule } from './staking-routing.module';

@NgModule({
  declarations: [StakingComponent],
  imports: [SharedModule, StakingRoutingModule],
})
export class StakingModule {}
