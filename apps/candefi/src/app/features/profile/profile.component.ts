import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../environments/environment';
import {
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
  owner: TokenDetails[];
  listings: TokenDetailsWithStatus[];
  listingsCalls: TokenDetailsWithStatus[];
  listingsPuts: TokenDetailsWithStatus[];
  isLoadingWriter: boolean;
  isLoadingOwner: boolean;
}

const DEFAULT_STATE: ProfileState = {
  address: '',
  owner: [],
  listings: [],
  isLoadingWriter: true,
  isLoadingOwner: true,
  listingsCalls: [],
  listingsPuts: [],
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
      finalize(() => this.set({ isLoadingWriter: false }))
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
      'owner',
      this.globalState.select('address').pipe(
        switchMap((a) =>
          this.candefi.tokensOfJson(a).pipe(
            mergeAll(),
            mergeMap((token) => this.rentfuse.getListingForNft(token)),
            toArray(),
            finalize(() => this.set({ isLoadingOwner: false }))
          )
        )
      )
    );
  }

  public cancelListing(tokenId: string): void {
    this.candefi
      .cancelListing(this.get('address'), tokenId)
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
      status = 'LENT';
    }
    return {
      status,
      ...listedToken,
    };
  }
}
