import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
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

interface ProfileState {
  address: string;
  owner: TokenDetails[];
  openListings: TokenDetails[];
  openListingsCalls: TokenDetails[];
  openListingsPuts: TokenDetails[];
  isLoadingWriter: boolean;
  isLoadingOwner: boolean;
}

const DEFAULT_STATE: ProfileState = {
  address: '',
  owner: [],
  openListings: [],
  isLoadingWriter: true,
  isLoadingOwner: true,
  openListingsCalls: [],
  openListingsPuts: [],
};
@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends RxState<ProfileState> {
  readonly state$ = this.select();

  readonly fetchOpenListings$ = (address: string) =>
    this.candefi.tokensOfWriterJson(address).pipe(
      mergeAll(),
      mergeMap((token) => this.rentfuse.getListingForNft(token)),
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
      'openListings',
      this.globalState
        .select('address')
        .pipe(switchMap((a) => this.fetchOpenListings$(a)))
    );
    this.connect(
      'openListingsCalls',
      this.select('openListings').pipe(
        map((t) => t.filter((t) => t.type === 'Call'))
      )
    );

    this.connect(
      'openListingsPuts',
      this.select('openListings').pipe(
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
}
