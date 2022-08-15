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

  /*  finishRentalCalls(): void {
    const tokens: TokenDetails[] = this.get('selectedRentalCalls');

    if (tokens.length < 1) {
      this.ui.displayInfo('You have no calls selected');
      return;
    }
    const neoPrice = this.globalState.get('neoPrice');
    const unsafeTokens = tokens.filter((t) => !t.safe);
    const aboveStrikeTokens = tokens.filter(
      (t) => t.safe && t.strike < neoPrice.curr
    );
    const warningAmount = unsafeTokens.length + aboveStrikeTokens.length;
    let message = '';
    const tokenIds: string[] = this.get('selectedRentalCalls').map(
      (call) => call.tokenId
    );
    if (warningAmount > 0) {
      message =
        'You have ' +
        warningAmount +
        ' selected call(s) that should be exercised rather than cancelled. Cancelling will cause a higher loss. Are you sure you want to continue?';

      this.confirmation.confirm({
        message,
        header: 'Cancel Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          ('');
        },
        reject: (type: ConfirmEventType) => {
          switch (type) {
            case ConfirmEventType.REJECT:
              break;
            case ConfirmEventType.CANCEL:
              break;
          }
        },
      });
    }
  }

  finishRentalPuts(): void {
    const tokens: TokenDetails[] = this.get('selectedRentalPuts');
    if (tokens.length < 1) {
      this.ui.displayInfo('You have no puts selected');
      return;
    }
    const neoPrice = this.globalState.get('neoPrice');

    const unsafeTokens = tokens.filter((t) => !t.safe);
    const belowStrikeTokens = tokens.filter(
      (t) => t.safe && t.strike > neoPrice.curr
    );
    const warningAmount = unsafeTokens.length + belowStrikeTokens.length;
    let message = '';
    if (warningAmount > 0) {
      message =
        'You have ' +
        warningAmount +
        ' selected put(s) that should be exercised rather than cancelled. Cancelling will cause a higher loss. Are you sure you want to continue?';
    }
    const tokenIds: string[] = this.get('selectedRentalPuts').map(
      (call) => call.tokenId
    );
    this.confirmation.confirm({
      message,
      header: 'Cancel Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        ('');
      },
      reject: (type: ConfirmEventType) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            break;
          case ConfirmEventType.CANCEL:
            break;
        }
      },
    });
  }

  exerciseCalls(): void {
    const tokenIds: string[] = this.get('selectedRentalCalls').map(
      (call) => call.tokenId
    );
    if (tokenIds.length < 1) {
      this.ui.displayInfo('You have no call(s) selected');
      return;
    }
    this.candefi
      .exercise(this.get('address'), tokenIds)
      .subscribe((res) => console.log(res));
  }

  exercisePuts(): void {
    const tokenIds: string[] = this.get('selectedRentalPuts').map(
      (put) => put.tokenId
    );
    if (tokenIds.length < 1) {
      this.ui.displayInfo('You have no put(s) selected');
      return;
    }
    this.candefi
      .exercise(this.get('address'), tokenIds)
      .subscribe((res) => console.log(res));
  } */
}
