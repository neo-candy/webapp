import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LeaderboardRoutingModule } from './leaderboard-routing.module';
import { LeaderboardComponent } from './leaderboard.component';

@NgModule({
  declarations: [LeaderboardComponent],
  imports: [LeaderboardRoutingModule, SharedModule],
  exports: [LeaderboardComponent],
})
export class LeaderBoardModule {}
