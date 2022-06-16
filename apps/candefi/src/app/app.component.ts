import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BinanceService } from './services/binance.service';
import { NeolineService } from './services/neoline.service';
import { GlobalState, GLOBAL_RX_STATE } from './state/global.state';

@Component({
  selector: 'webapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  neoPrice$ = timer(0, 5000).pipe(switchMap(() => this.binance.neoPrice()));
  state$ = this.globalState.select();
  constructor(
    private neoline: NeolineService,
    private binance: BinanceService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    this.globalState.connect('address', this.neoline.ACCOUNT_CHANGED_EVENT$);
    this.globalState.connect('neoPrice', this.neoPrice$);
  }
}
