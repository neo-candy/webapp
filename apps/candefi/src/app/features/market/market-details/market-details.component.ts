import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { from, of, Subject } from 'rxjs';
import { finalize, map, switchMap, toArray } from 'rxjs/operators';
import { CandefiService, Token } from '../../../services/candefi.service';
import { Listing, RentfuseService } from '../../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../state/global.state';

interface Stats {
  day: number;
  gas: number;
}
interface TokenDetails extends Token {
  listingId: number;
  minRentInMinutes: number;
  maxRentInMinutes: number;
  gasPerMinute: number;
  stats: Stats[];
}

interface MarketDetailsState {
  tokens: TokenDetails[];
  isLoading: boolean;
}

const DEFAULT_STATE: MarketDetailsState = {
  tokens: [],
  isLoading: true,
};

@Component({
  templateUrl: './market-details.component.html',
  styleUrls: ['./market-details.component.scss'],
})
export class MarketDetailsComponent extends RxState<MarketDetailsState> {
  readonly state$ = this.select();
  readonly onToken$ = new Subject<Token>();
  readonly fetchTokenDetails$ = (token: Token) =>
    of(token).pipe(
      switchMap((token) =>
        this.rentfuse
          .getListingIdFromNft(token.tokenId)
          .pipe(map((id) => ({ listingId: id, ...token })))
      ),
      switchMap((tokenWithListingId) =>
        this.rentfuse
          .getListing(tokenWithListingId.listingId)
          .pipe(map((listing) => this.addTokenDetails(token, listing)))
      )
    );

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private rentfuse: RentfuseService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    from(this.config.data.tokens as Token[])
      .pipe(
        switchMap((token: Token) => this.fetchTokenDetails$(token)),
        toArray(),
        finalize(() => this.set({ isLoading: false }))
      )
      .subscribe((res) => {
        this.set({ tokens: res });
      });
  }

  onRowSelect(event: any): void {
    this.rentfuse
      .getListingIdFromNft(event.data.tokenId)
      .subscribe((id) =>
        window.open('https://www.testnet.rentfuse.com/listings/' + id, '_blank')
      );
  }

  private addTokenDetails(token: Token, listing: Listing): TokenDetails {
    return {
      ...token,
      listingId: listing.listingId,
      maxRentInMinutes: listing.maxMinutes,
      minRentInMinutes: listing.minMinutes,
      gasPerMinute: listing.gasPerMinute / 100000000,
      stats: Array(listing.maxMinutes / 24 / 60).fill(
        (listing.gasPerMinute / 100000000) * 24 * 60
      ),
      vi: (token.vi / Math.pow(10, 9)) * Math.pow(10, 8),
      realValue:
        token.realValue +
        (this.globalState.get('neoPrice') * Math.pow(10, 8) - token.strike) *
          token.vi,
    };
  }
}
