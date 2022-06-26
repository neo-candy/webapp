import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../environments/environment';
import {
  filter,
  finalize,
  map,
  mergeAll,
  mergeMap,
  switchMap,
  toArray,
} from 'rxjs/operators';
import { CandefiService } from '../../services/candefi.service';
import { RentfuseService, TokenDetails } from '../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { ConfirmationService, ConfirmEventType, MenuItem } from 'primeng/api';
import { UiService } from '../../services/ui.service';

interface TokenDetailsWithStatus extends TokenDetails {
  status: string;
}

interface ProfileState {
  address: string;
  rentals: TokenDetails[];
  ownedCalls: TokenDetails[];
  ownedPuts: TokenDetails[];
  listings: TokenDetailsWithStatus[];
  listingsCalls: TokenDetailsWithStatus[];
  listingsPuts: TokenDetailsWithStatus[];
  isLoadingListings: boolean;
  isLoadingOwned: boolean;
  selectedRentalCalls: TokenDetails[];
  selectedRentalPuts: TokenDetails[];
}

const DEFAULT_STATE: ProfileState = {
  address: '',
  rentals: [],
  listings: [],
  isLoadingListings: true,
  isLoadingOwned: true,
  listingsCalls: [],
  listingsPuts: [],
  ownedCalls: [],
  ownedPuts: [],
  selectedRentalCalls: [],
  selectedRentalPuts: [],
};
@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [ConfirmationService],
})
export class ProfileComponent extends RxState<ProfileState> {
  readonly state$ = this.select();
  callRentalsItems: MenuItem[] = [
    {
      label: 'Exercise',
      icon: 'pi pi-eject',
      command: () => this.exerciseCalls(),
    },
    {
      label: 'Cancel',
      icon: 'pi pi-times',
      command: () => this.finishRentalCalls(),
    },
  ];
  putRentalsItems: MenuItem[] = [
    {
      label: 'Exercise',
      icon: 'pi pi-eject',
      command: () => this.exercisePuts(),
    },
    {
      label: 'Cancel',
      icon: 'pi pi-times',
      command: () => this.finishRentalPuts(),
    },
  ];
  readonly fetchListings$ = (address: string) =>
    this.candefi.tokensOfWriterJson(address).pipe(
      mergeAll(),
      mergeMap((token) => this.rentfuse.getListingForNft(token)),
      map((listing) => this.mapStatus(listing)),
      toArray(),
      finalize(() => this.set({ isLoadingListings: false }))
    );

  constructor(
    private candefi: CandefiService,
    private rentfuse: RentfuseService,
    private ui: UiService,
    private confirmation: ConfirmationService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();

    this.set(DEFAULT_STATE);
    this.connect('address', this.globalState.select('address'));
    this.connect(
      'listings',
      this.globalState
        .select('address')
        .pipe(switchMap((a) => this.fetchListings$(a)))
    );
    this.connect(
      'listingsCalls',
      this.select('listings').pipe(
        map((t) => t.filter((t) => t.type === 'Call'))
      )
    );
    this.connect(
      'listingsPuts',
      this.select('listings').pipe(
        map((t) => t.filter((t) => t.type === 'Put'))
      )
    );
    this.connect(
      'rentals',
      this.globalState.select('address').pipe(
        switchMap((a) =>
          this.candefi.tokensOfJson(a).pipe(
            mergeAll(),
            mergeMap((token) => this.rentfuse.getListingForNft(token)),
            filter((v) => v.owner !== v.writer),
            toArray(),
            finalize(() => this.set({ isLoadingOwned: false }))
          )
        )
      )
    );
    this.connect(
      'ownedCalls',
      this.select('rentals').pipe(
        map((t) => t.filter((t) => t.type === 'Call' && t.writer !== t.owner))
      )
    );
    this.connect(
      'ownedPuts',
      this.select('rentals').pipe(
        map((t) => t.filter((t) => t.type === 'Put' && t.writer !== t.owner))
      )
    );
  }

  cancelListing(tokenId: string): void {
    this.candefi
      .cancelListing(this.get('address'), tokenId)
      .subscribe((res) => console.log(res));
  }

  finishRentalCalls(): void {
    const tokens: TokenDetails[] = this.get('selectedRentalCalls');

    if (tokens.length < 1) {
      this.ui.displayInfo('You have no calls selected');
      return;
    }
    const neoPrice = this.globalState.get('neoPrice');
    const unsafeTokens = tokens.filter((t) => !t.safe);
    const aboveStrikeTokens = tokens.filter(
      (t) => t.safe && t.strike < neoPrice
    );
    const warningAmount = unsafeTokens.length + aboveStrikeTokens.length;
    let message = '';
    if (warningAmount > 0) {
      message =
        'You have ' +
        warningAmount +
        ' selected call(s) that should be exercised rather than cancelled. Cancelling will cause a higher loss. Are you sure you want to continue?';
    }
    const tokenIds: string[] = this.get('selectedRentalCalls').map(
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

  finishRentalPuts(): void {
    const tokens: TokenDetails[] = this.get('selectedRentalPuts');
    if (tokens.length < 1) {
      this.ui.displayInfo('You have no puts selected');
      return;
    }
    const neoPrice = this.globalState.get('neoPrice');

    const unsafeTokens = tokens.filter((t) => !t.safe);
    const belowStrikeTokens = tokens.filter(
      (t) => t.safe && t.strike > neoPrice
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
      this.ui.displayInfo('You have no calls selected');
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
      this.ui.displayInfo('You have no puts selected');
      return;
    }
    this.candefi
      .exercise(this.get('address'), tokenIds)
      .subscribe((res) => console.log(res));
  }

  private mapStatus(listedToken: TokenDetails): TokenDetailsWithStatus {
    let status = 'UNKNOWN';
    if (listedToken.exercised && listedToken.owner === listedToken.writer) {
      status = 'EXERCISED';
    } else if (
      !listedToken.exercised &&
      listedToken.owner === environment.testnet.rentfuseAddress
    ) {
      status = 'LISTED';
    } else if (listedToken.owner !== environment.testnet.rentfuseAddress) {
      status = 'ONGOING';
    }
    return {
      status,
      ...listedToken,
    };
  }
}
