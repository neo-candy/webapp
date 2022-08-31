import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { Observable, timer } from 'rxjs';
import { map, pairwise, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { ContextService, THEME_CTX_KEY } from './services/context.service';
import { PriceService } from './services/price.service';
import { ThemeService } from './services/theme.service';
import { GlobalState, GLOBAL_RX_STATE, Price } from './state/global.state';

@Component({
  selector: 'webapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  neoPrice$: Observable<Price> = timer(0, 5000).pipe(
    switchMap(() => this.price.neoPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  candyPrice$: Observable<Price> = timer(0, 5000).pipe(
    switchMap(() => this.price.candyPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  gasPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.gasPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  flmPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.flmPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  bnbPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.bnbPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  solPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.solPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  adaPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.adaPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  btcPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.btcPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  ethPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.ethPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  xrpPrice$: Observable<Price> = timer(0, 10000).pipe(
    switchMap(() => this.price.xrpPrice()),
    startWith(0),
    pairwise(),
    map(([prev, curr]) => ({ curr: curr, prev }))
  );
  readonly state$ = this.globalState.select();
  constructor(
    public theme: ThemeService,
    private price: PriceService,
    private context: ContextService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    this.globalState.connect('neoPrice', this.neoPrice$);
    this.globalState.connect('candyPrice', this.candyPrice$);
    this.globalState.connect('gasPrice', this.gasPrice$);
    this.globalState.connect('bnbPrice', this.bnbPrice$);
    this.globalState.connect('xrpPrice', this.xrpPrice$);
    this.globalState.connect('btcPrice', this.btcPrice$);
    this.globalState.connect('ethPrice', this.ethPrice$);
    this.globalState.connect('solPrice', this.solPrice$);
    this.globalState.connect('adaPrice', this.adaPrice$);
    this.globalState.connect('flmPrice', this.flmPrice$);
    this.theme.switchTheme(this.context.get(THEME_CTX_KEY) ?? theme.current);
  }

  viewTransaction(txid: string): void {
    window.open(environment.testnet.txExplorer + txid, '_blank');
  }
}
