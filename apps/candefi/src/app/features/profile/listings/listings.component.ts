import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { SelectItem } from 'primeng/api';
import { BehaviorSubject, Subject } from 'rxjs';
import {
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
  TokenDetails,
} from '../../../services/rentfuse.service';
import { ThemeService } from '../../../services/theme.service';
import {
  GlobalState,
  GLOBAL_RX_STATE,
  Price,
} from '../../../state/global.state';

type LayoutChangeEvent = { value: string };
const FILTER_VALUE_CALL = 'call';
const FILTER_VALUE_PUT = 'put';
interface ListingState {
  layoutOptions: SelectItem[];
  selectedLayout: string;
  isLoading: boolean;
  tokens: TokenDetails[];
  pendingTokens: TokenDetails[];
  activeTokens: TokenDetails[];
  expiredTokens: TokenDetails[];
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
            map((listings) =>
              listings.filter(
                (listing) =>
                  listing.type.toLowerCase() === layout.value.toLowerCase() &&
                  !listing.renting
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
                  listing.renting
              )
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
}
