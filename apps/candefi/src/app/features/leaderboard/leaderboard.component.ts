import { Component } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { finalize } from 'rxjs/operators';
import { CandefiService, Earnings } from '../../services/candefi.service';

interface LeaderboardState {
  list: Earnings[];
  isLoading: boolean;
}

const DEFAULT_STATE: LeaderboardState = {
  list: [],
  isLoading: true,
};

@Component({
  selector: 'cd-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent extends RxState<LeaderboardState> {
  readonly state$ = this.select();
  constructor(private candefi: CandefiService) {
    super();
    this.set(DEFAULT_STATE);
    this.connect(
      'list',
      this.candefi
        .earnings()
        .pipe(finalize(() => this.set({ isLoading: false })))
    );
  }
}
