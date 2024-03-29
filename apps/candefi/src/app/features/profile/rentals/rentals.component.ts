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
import { determineCurrentValue, isExpired } from '../../../shared/utils';
import {
  GlobalState,
  GLOBAL_RX_STATE,
  Price,
} from '../../../state/global.state';
import { TokenWithCurrentNFTValue } from '../listings/listings.component';

type LayoutChangeEvent = { value: string };
const FILTER_VALUE_CALL = 'call';
const FILTER_VALUE_PUT = 'put';
interface RentalState {
  layoutOptions: SelectItem[];
  selectedLayout: string;
  isLoading: boolean;
  tokens: TokenWithListingOptionalRenting[];
  activeTokens: TokenWithListingOptionalRenting[];
  neoPrice: Price;
}

const DEFAULT_STATE: RentalState = {
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
  activeTokens: [],
  selectedLayout: 'calls',
  neoPrice: { curr: 0, prev: 0 },
};

@Component({
  selector: 'cd-rentals',
  templateUrl: './rentals.component.html',
  styleUrls: ['./rentals.component.scss'],
})
export class RentalsComponent extends RxState<RentalState> {
  readonly onLayoutChange$: Subject<LayoutChangeEvent> = new BehaviorSubject({
    value: FILTER_VALUE_CALL,
  });
  readonly state$ = this.select();
  readonly fetchRentings$ = (address: string) =>
    this.candefi.tokensOfJson(address, 1, 999).pipe(
      mergeAll(),
      mergeMap((token) => this.rentfuse.getListingAndRentingForToken(token)),
      filter(
        (token) =>
          !!token.renting && token.owner !== token.writer && !isExpired(token)
      ),
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
        switchMap((a) => this.fetchRentings$(a)),
        map((listings) => listings.sort((a, b) => a.strike - b.strike))
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
                  listing.type.toLowerCase() === layout.value.toLowerCase()
              )
            ),
            map((rentals) => rentals.map((rental) => this.mapProfits(rental)))
          )
        )
      )
    );

    this.connect('neoPrice', this.globalState.select('neoPrice'));
  }

  private mapProfits(
    token: TokenWithListingOptionalRenting
  ): TokenWithCurrentNFTValue {
    const neoPrice = this.globalState.get('neoPrice').curr;
    const candyPrice = this.globalState.get('candyPrice').curr;
    const currentValue = determineCurrentValue(token, neoPrice) * candyPrice;
    const earnedFees =
      token.listing.gasPerMinute *
      (token.renting ? token.renting?.duration : 0) *
      this.globalState.get('gasPrice').curr;
    return {
      ...token,
      delta: currentValue - earnedFees,
      currentValue: currentValue,
      paidFees: earnedFees,
    };
  }

  goToTokenDetails(tokenId: string) {
    this.router.navigate(['/tokens/' + atob(tokenId)]);
  }
}
