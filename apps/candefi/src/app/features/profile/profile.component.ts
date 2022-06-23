import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import {
  finalize,
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
  writer: TokenDetails[];
  isLoadingWriter: boolean;
  isLoadingOwner: boolean;
}

const DEFAULT_STATE: ProfileState = {
  address: '',
  owner: [],
  writer: [],
  isLoadingWriter: true,
  isLoadingOwner: true,
};
@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends RxState<ProfileState> {
  readonly state$ = this.select();

  readonly fetchWriterTokens$ = (address: string) =>
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
      'writer',
      this.globalState
        .select('address')
        .pipe(switchMap((a) => this.fetchWriterTokens$(a)))
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
