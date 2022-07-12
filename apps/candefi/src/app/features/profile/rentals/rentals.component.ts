import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { SelectItem } from 'primeng/api';
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
  RentfuseService,
  TokenDetails,
} from '../../../services/rentfuse.service';
import { ThemeService } from '../../../services/theme.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../state/global.state';

interface RentalsState {
  layoutOptions: SelectItem[];
  selectedLayout: string;
  isLoading: boolean;
  tokens: TokenDetails[];
  filteredTokens: TokenDetails[];
  neoPrice: number;
}

const DEFAULT_STATE: RentalsState = {
  layoutOptions: [
    {
      value: 'call',
      label: 'Calls',
    },
    {
      value: 'put',
      label: 'Puts',
    },
  ],
  isLoading: true,
  tokens: [],
  selectedLayout: 'calls',
  filteredTokens: [],
  neoPrice: 0,
};

@Component({
  selector: 'cd-rentals',
  templateUrl: './rentals.component.html',
  styleUrls: ['./rentals.component.scss'],
})
export class RentalsComponent extends RxState<RentalsState> {
  atob = atob;
  readonly state$ = this.select();
  readonly fetchRentals$ = (address: string) =>
    this.candefi.tokensOfWriterJson(address).pipe(
      mergeAll(),
      mergeMap((token) => this.rentfuse.getListingAndRentingForToken(token)),
      filter((t) => !!t.renting),
      toArray(),
      finalize(() => this.set({ isLoading: false }))
    );

  constructor(
    private candefi: CandefiService,
    private rentfuse: RentfuseService,
    private router: Router,
    public theme: ThemeService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect(
      'tokens',
      this.globalState.select('address').pipe(
        switchMap((a) => this.fetchRentals$(a)),
        map((v) => v.sort((a, b) => a.strike - b.strike))
      )
    );
    this.connect(
      'filteredTokens',
      this.select('tokens').pipe(
        map((tokens) =>
          tokens.filter(
            (token) => token.type.toLowerCase() === this.get('selectedLayout')
          )
        )
      )
    );
    this.connect('neoPrice', this.globalState.select('neoPrice'));
  }

  onLayoutChange(event: { value: string }): void {
    this.set({
      filteredTokens: this.get('tokens').filter(
        (token) => token.type.toLowerCase() === event.value.toLowerCase()
      ),
    });
  }

  goToTokenDetails(tokenId: string) {
    this.router.navigate(['/tokens/' + atob(tokenId)]);
  }
}
