import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { SelectItem } from 'primeng/api';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  filter,
  finalize,
  map,
  mergeAll,
  mergeMap,
  switchMap,
  toArray,
} from 'rxjs/operators';
import { CandefiService } from '../../../services/candefi.service';
import {
  ContextService,
  LISTING_TYPE_FILTER_CTX_KEY,
} from '../../../services/context.service';
import {
  RentfuseService,
  TokenWithListingOptionalRenting,
} from '../../../services/rentfuse.service';
import { ThemeService } from '../../../services/theme.service';
import {
  ProfitCalculatorComponent,
  ProfitCalculatorParams,
} from '../../../shared/components/profit-calculator/profit-calculator.component';
import { isExpired } from '../../../shared/utils';
import {
  GlobalState,
  GLOBAL_RX_STATE,
  Price,
} from '../../../state/global.state';

interface TokenWithNFTValue extends TokenWithListingOptionalRenting {
  nftValue: number;
  paidFees: number;
  delta: number;
}
type LayoutChangeEvent = { value: string };
const FILTER_VALUE_CALL = 'call';
const FILTER_VALUE_PUT = 'put';
interface ListingState {
  layoutOptions: SelectItem[];
  selectedLayout: string;
  isLoading: boolean;
  tokens: TokenWithListingOptionalRenting[];
  pendingTokens: TokenWithListingOptionalRenting[];
  activeTokens: TokenWithNFTValue[];
  expiredTokens: TokenWithNFTValue[];
  neoPrice: Price;
}

const DEFAULT_STATE: ListingState = {
  layoutOptions: [
    {
      value: FILTER_VALUE_CALL,
      label: 'Calls',
    },
    {
      value: FILTER_VALUE_PUT,
      label: 'Puts',
    },
  ],
  isLoading: true,
  tokens: [],
  pendingTokens: [],
  activeTokens: [],
  expiredTokens: [],
  selectedLayout: 'calls',
  neoPrice: { curr: 0, prev: 0 },
};

@Component({
  selector: 'cd-listings',
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.scss'],
})
export class ListingsComponent extends RxState<ListingState> {
  readonly onLayoutChange$: Subject<LayoutChangeEvent> = new BehaviorSubject({
    value: FILTER_VALUE_CALL,
  });
  readonly state$ = this.select();
  readonly fetchListings$ = (address: string) =>
    this.candefi.tokensOfWriterJson(address).pipe(
      mergeAll(),
      mergeMap((token) => this.rentfuse.getListingAndRentingForToken(token)),
      filter((token) => token.listing.listingId !== 0),
      toArray(),
      finalize(() => this.set({ isLoading: false }))
    );

  constructor(
    private candefi: CandefiService,
    private rentfuse: RentfuseService,
    private router: Router,
    private context: ContextService,
    public theme: ThemeService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.set({
      selectedLayout:
        this.context.get(LISTING_TYPE_FILTER_CTX_KEY) ?? FILTER_VALUE_CALL,
    });

    this.connect(
      'tokens',
      this.globalState.select('address').pipe(
        switchMap((a) => this.fetchListings$(a)),
        map((listings) => listings.sort((a, b) => a.strike - b.strike))
      )
    );

    this.connect(
      'pendingTokens',
      this.onLayoutChange$.pipe(
        switchMap((layout) =>
          this.select('tokens').pipe(
            map((tokens) =>
              tokens.filter(
                (token) =>
                  token.type.toLowerCase() === layout.value.toLowerCase() &&
                  !token.renting
              )
            )
          )
        )
      )
    );

    this.connect(
      'activeTokens',
      this.onLayoutChange$.pipe(
        switchMap((layout) =>
          this.select('tokens').pipe(
            map((listings) =>
              listings.filter(
                (listing) =>
                  listing.type.toLowerCase() === layout.value.toLowerCase() &&
                  listing.renting &&
                  !isExpired(listing) &&
                  listing.owner === listing.renting.borrower
              )
            ),
            map((listings) =>
              listings.map((listing) => this.mapNFTValue(listing))
            )
          )
        )
      )
    );

    this.connect(
      'expiredTokens',
      this.onLayoutChange$.pipe(
        switchMap((layout) =>
          this.select('tokens').pipe(
            map((listings) =>
              listings.filter(
                (listing) =>
                  listing.type.toLowerCase() === layout.value.toLowerCase() &&
                  listing.renting &&
                  isExpired(listing) &&
                  listing.owner === listing.renting.borrower
              )
            ),
            map((listings) =>
              listings.map((listing) => this.mapNFTValue(listing))
            )
          )
        )
      )
    );

    this.connect('neoPrice', this.globalState.select('neoPrice'));
  }

  goToTokenDetails(tokenId: string) {
    this.router.navigate(['/tokens/' + atob(tokenId)]);
  }

  private mapNFTValue(
    token: TokenWithListingOptionalRenting
  ): TokenWithNFTValue {
    if (!token.renting) {
      throw new Error('mapNFTValue_noRenting');
    }

    const value = this.calculateValue(token);
    const paidFees =
      token.listing.gasPerMinute *
      token.renting?.duration *
      this.globalState.get('gasPrice').curr;
    return {
      ...token,
      delta: paidFees - value,
      nftValue: value,
      paidFees: paidFees,
    };
  }

  private calculateValue(token: TokenWithListingOptionalRenting): number {
    const params: ProfitCalculatorParams = {
      dailyFee: token.listing.gasPerMinute * 60 * 24,
      final: false,
      fromDays: 0,
      toDays: 0,
      fromStrike: 0,
      toStrike: 0,
      initialValue: token.value,
      isSafe: token.safe,
      leverage: token.leverage,
      seller: false,
      stake: token.stake,
      strike: token.strike,
      timeDecay: token.timeDecay,
      type: token.type === 'Call' ? 'call' : 'put',
    };
    if (!token.renting) {
      throw new Error('calculateLenderProfit_noRenting');
    }
    const durationInDays =
      (new Date().getTime() - token.renting.startedAt) / 1000 / 60 / 60 / 24;

    const calculatedValue = ProfitCalculatorComponent.calculateValue(
      params,
      durationInDays,
      this.globalState.get('neoPrice').curr,
      this.globalState.get('gasPrice').curr,
      this.globalState.get('candyPrice').curr
    );
    return calculatedValue;
  }
}
