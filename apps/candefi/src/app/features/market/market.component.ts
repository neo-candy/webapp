import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../environments/environment';
import { DialogService } from 'primeng/dynamicdialog';
import { finalize, map, tap } from 'rxjs/operators';
import { CandefiService, CandefiToken } from '../../services/candefi.service';
import { RentfuseService } from '../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { MarketDetailsComponent } from './market-details/market-details.component';

interface MarketState {
  tokens: CandefiToken[];
  calls: OptionOverview[];
  puts: OptionOverview[];
  neoPrice: number;
  isLoading: boolean;
}

const DEFAULT_STATE: MarketState = {
  tokens: [],
  calls: [],
  puts: [],
  neoPrice: 0,
  isLoading: true,
};

interface OptionOverview {
  strike: number;
  volume: number;
  stake: number;
}
@Component({
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss'],
  providers: [DialogService],
})
export class MarketComponent extends RxState<MarketState> {
  readonly state$ = this.select();
  readonly calls$ = this.select('tokens').pipe(
    map((t) => t.filter((t) => t.type === 'Call' && !t.exercised)),
    map((t) => this.summarize(t).sort((a, b) => a.strike - b.strike))
  );
  readonly puts$ = this.select('tokens').pipe(
    map((t) => t.filter((t) => t.type === 'Put' && !t.exercised)),
    map((t) => this.summarize(t).sort((a, b) => a.strike - b.strike))
  );

  constructor(
    private dialogService: DialogService,
    private candefi: CandefiService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect(
      'tokens',
      this.candefi
        .tokensOfJson(environment.testnet.rentfuseAddress)
        .pipe(
          tap(() => this.set({ isLoading: false }))
        ) /* 'NSjnxcxV6qXGFLbo1vSAsSqRjBiyB6Qz7V' */
    );
    this.connect('neoPrice', this.globalState.select('neoPrice'));
    this.connect('calls', this.calls$);
    this.connect('puts', this.puts$);
  }

  onCallsRowSelect(token: CandefiToken): void {
    const strike = token.strike;

    this.dialogService.open(MarketDetailsComponent, {
      header: 'Calls',
      width: '90%',
      data: {
        tokens: this.get('tokens')
          .filter((t) => t.type === 'Call')
          .filter((t) => t.strike === strike),
      },
    });
  }

  onPutsRowSelect(token: CandefiToken): void {
    const strike = token.strike;
    this.dialogService.open(MarketDetailsComponent, {
      header: 'Puts',
      width: '70%',
      data: {
        tokens: this.get('tokens')
          .filter((t) => t.type === 'Put')
          .filter((t) => t.strike === strike),
      },
    });
  }

  private summarize(tokens: CandefiToken[]): OptionOverview[] {
    const map: Map<number, number[]> = new Map();
    tokens.forEach((token) => {
      const stack = map.get(token.strike) ?? [];
      stack.push(token.stake);
      map.set(token.strike, stack);
    });

    const result: OptionOverview[] = [];
    map.forEach((v, k) => {
      result.push({
        stake: v.reduce((p, c) => p + c, 0),
        strike: k,
        volume: v.length,
      });
    });
    return result;
  }
}
