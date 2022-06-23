import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { timer } from 'rxjs';
import { switchMap, take, takeLast, tap } from 'rxjs/operators';
import { PriceService } from './services/price.service';
import { NeolineService } from './services/neoline.service';
import { GlobalState, GLOBAL_RX_STATE } from './state/global.state';
import { UiService } from './services/ui.service';

@Component({
  selector: 'webapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  neoPrice$ = timer(0, 5000).pipe(switchMap(() => this.price.neoPrice()));
  gasPrice$ = timer(0, 5000).pipe(switchMap(() => this.price.gasPrice()));
  candyPrice$ = timer(0, 30000).pipe(switchMap(() => this.price.candyPrice()));
  state$ = this.globalState.select();
  constructor(
    private price: PriceService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    this.globalState.connect('neoPrice', this.neoPrice$);
    this.globalState.connect('gasPrice', this.gasPrice$);
    this.globalState.connect('candyPrice', this.candyPrice$);
  }
}
