import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';

import { CandefiService } from '../../services/candefi.service';
import { RentfuseService } from '../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/api';
import { UiService } from '../../services/ui.service';
import {
  ContextService,
  LAST_VISITED_PROFILE_CTX_KEY,
} from '../../services/context.service';

interface ProfileState {
  address: string;
  layouts: SelectItem[];
}

const DEFAULT_STATE: ProfileState = {
  address: '',
  layouts: [
    { label: 'Calls', value: 'calls' },
    { label: 'Puts', value: 'puts' },
  ],
};
@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ConfirmationService],
})
export class ProfileComponent extends RxState<ProfileState> {
  items: MenuItem[] = [
    {
      label: 'Statistics',
      items: [
        {
          label: 'Earnings',
          disabled: true,
          routerLinkActiveOptions: { exact: true },
        },
        {
          label: 'History',
          disabled: true,
          routerLinkActiveOptions: { exact: true },
        },
      ],
    },
    {
      label: 'Portfolio',
      items: [
        {
          label: 'Listings',
          routerLink: ['listings'],
          routerLinkActiveOptions: { exact: true },
          command: () =>
            this.context.put(LAST_VISITED_PROFILE_CTX_KEY, 'listings'),
        },
        {
          label: 'Rentings',
          routerLink: ['rentings'],
          routerLinkActiveOptions: { exact: true },
          command: () =>
            this.context.put(LAST_VISITED_PROFILE_CTX_KEY, 'rentings'),
        },
        {
          label: 'Storage',
          routerLink: ['storage'],
          routerLinkActiveOptions: { exact: true },
          command: () =>
            this.context.put(LAST_VISITED_PROFILE_CTX_KEY, 'storage'),
        },
      ],
    },
  ];
  readonly state$ = this.select();

  constructor(
    private context: ContextService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect('address', this.globalState.select('address'));
  }
}
