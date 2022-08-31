import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfitCalculatorComponent } from './shared/components/profit-calculator/profit-calculator.component';
import { AuthGuard } from './shared/guards/auth.guard';

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
    canActivate: [AuthGuard],
  },
  {
    path: 'tokens',
    loadChildren: () =>
      import('./features/token-details/token-details.module').then(
        (m) => m.TokenDetailsModule
      ),
  },
  {
    path: 'calculator',
    component: ProfitCalculatorComponent,
  },
  {
    path: '**',
    loadChildren: () =>
      import('./features/not-found/not-found.module').then(
        (m) => m.NotFoundModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
