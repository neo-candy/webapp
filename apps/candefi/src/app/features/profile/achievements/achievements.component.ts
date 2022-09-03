import { Component } from '@angular/core';
import { RxState } from '@rx-angular/state';

interface Rarity {
  label: string;
  severity: string;
}
interface AchievementsState {
  achievements: Achievement[];
}

interface Achievement {
  image: string;
  desc: string;
  title: string;
  locked: boolean;
  rarity: Rarity;
}

const DEFAULT_STATE: AchievementsState = {
  achievements: [
    {
      image: 'beta.png',
      desc: ' A rare badge for beta testers. This achievement is only available for a limited time and is is claimed automatically upon logging in during the beta phase.',
      locked: false,
      title: 'Beta Tester',
      rarity: { label: 'Rare', severity: 'success' },
    },
  ],
};
@Component({
  selector: 'cd-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
})
export class AchievementsComponent extends RxState<AchievementsState> {
  readonly state$ = this.select();
  constructor() {
    super();
    this.set(DEFAULT_STATE);
  }
}
