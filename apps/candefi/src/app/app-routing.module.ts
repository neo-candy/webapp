import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'markets',
    pathMatch: 'full',
  },
  {
    path: 'markets',
    loadChildren: () =>
      import('./features/market/market.module').then((m) => m.MarketModule),
  },
  {
    path: 'leaderboard',
    loadChildren: () =>
      import('./features/leaderboard/leaderboard.module').then(
        (m) => m.LeaderBoardModule
      ),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.module').then((m) => m.ProfileModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
