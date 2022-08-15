import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../../environments/environment';
import { finalize, map, switchMap } from 'rxjs/operators';
import {
  CandefiService,
  CandefiToken,
} from '../../../services/candefi.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../state/global.state';
import { Router } from '@angular/router';

interface StorageState {
  isLoading: boolean;
  tokensOfWriter: CandefiToken[];
  cancelledRentings: CandefiToken[];
  closedListings: CandefiToken[];
}

const DEFAULT_STATE: StorageState = {
  isLoading: true,
  tokensOfWriter: [],
  cancelledRentings: [],
  closedListings: [],
};
@Component({
  selector: 'cd-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss'],
})
export class StorageComponent extends RxState<StorageState> {
  readonly state$ = this.select();

  readonly fetchTokensOfWriter$ = (address: string) =>
    this.candefi.tokensOfWriterJson(address).pipe(
      finalize(() => {
        this.set({ isLoading: false });
      })
    );

  constructor(
    private candefi: CandefiService,
    private router: Router,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect(
      'tokensOfWriter',
      this.globalState.select('address').pipe(
        switchMap((a) => this.fetchTokensOfWriter$(a)),
        map((tokens) => tokens.sort((a, b) => a.created - b.created))
      )
    );

    this.connect(
      'cancelledRentings',
      this.select('tokensOfWriter').pipe(
        map((tokens) =>
          tokens.filter(
            (token) =>
              token.stake === 0 &&
              token.owner === environment.testnet.rentfuseAddress
          )
        )
      )
    );

    this.connect(
      'closedListings',
      this.select('tokensOfWriter').pipe(
        map((tokens) => tokens.filter((token) => token.writer === token.owner))
      )
    );
  }

  goToTokenDetails(tokenId: string) {
    this.router.navigate(['/tokens/' + atob(tokenId)]);
  }

  claimAll(): void {
    this.candefi
      .burn(this.globalState.get('address'), this.get('closedListings'))
      .subscribe(console.log);
  }

  closeAll(): void {
    this.candefi
      .closeListing(
        this.globalState.get('address'),
        this.get('cancelledRentings').map((token) => token.tokenId)
      )
      .subscribe(console.log);
  }
}
