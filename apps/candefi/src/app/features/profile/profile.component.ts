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

// open listings, exercised listings, running listings
// calls, puts

// rented listings

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
};
@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends RxState<ProfileState> {
  readonly state$ = this.select();

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

  public cancelListing(tokenId: string): void {
    this.candefi
      .cancelListing(this.get('address'), tokenId)
      .subscribe((res) => console.log(res));
  }

  public exercise(tokenId: string): void {
    this.candefi
      .exercise(this.get('address'), tokenId)
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
