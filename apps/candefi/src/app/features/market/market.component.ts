import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { environment } from 'apps/candefi/src/environments/environment';
import { DialogService } from 'primeng/dynamicdialog';
import { map } from 'rxjs/operators';
import { CandefiService, Token } from '../../services/candefi.service';
import { RentfuseService } from '../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { MarketDetailsComponent } from './market-details/market-details.component';

interface MarketState {
  tokens: Token[];
  calls: OptionOverview[];
  puts: OptionOverview[];
  neoPrice: number;
}

const DEFAULT_STATE: MarketState = {
  tokens: [],
  calls: [],
  puts: [],
  neoPrice: 0,
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
    map((t) => t.filter((t) => t.type === 'Call')),
    map((t) => this.summarize(t).sort((a, b) => a.strike - b.strike))
  );
  readonly puts$ = this.select('tokens').pipe(
    map((t) => t.filter((t) => t.type === 'Put')),
    map((t) => this.summarize(t).sort((a, b) => a.strike - b.strike))
  );

  constructor(
    private dialogService: DialogService,
    private candefi: CandefiService,
    private rentfuse: RentfuseService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect(
      'tokens',
      this.candefi.tokensOfJson(
        environment.testnet.rentfuseAddress
      ) /* 'NSjnxcxV6qXGFLbo1vSAsSqRjBiyB6Qz7V' */
    );
    this.connect('neoPrice', this.globalState.select('neoPrice'));
    this.connect('calls', this.calls$);
    this.connect('puts', this.puts$);
  }

  onCallsRowSelect(event: any): void {
    const strike = event.data.strike;

    this.dialogService.open(MarketDetailsComponent, {
      header: 'Calls',
      width: '70%',
      data: {
        tokens: this.get('tokens')
          .filter((t) => t.type === 'Call')
          .filter((t) => t.strike === strike),
      },
    });
  }

  onPutsRowSelect(event: any): void {
    const strike = event.data.strike;
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

  private summarize(tokens: Token[]): OptionOverview[] {
    const map: Map<number, number[]> = new Map();
    tokens.forEach((token) => {
      const stack = map.get(token.strike) ?? [];
      stack.push(token.stake);
      map.set(token.strike, stack);
    });
    console.log('OptionOverviewMap', map);

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
