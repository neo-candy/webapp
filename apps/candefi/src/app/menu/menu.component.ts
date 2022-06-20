import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { map } from 'rxjs/operators';
import { NeolineService } from '../services/neoline.service';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';

interface MenuState {
  isLoading: boolean;
  address: string;
  neoPrice: number;
  gasPrice: number;
  candyPrice: number;
}

const DEFAULT_STATE: MenuState = {
  isLoading: false,
  address: '',
  neoPrice: 0,
  gasPrice: 0,
  candyPrice: 0,
};
@Component({
  selector: 'cd-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent extends RxState<MenuState> {
  readonly state$ = this.select();

  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private neoline: NeolineService
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect('address', this.globalState.select('address'));
    this.connect('neoPrice', this.globalState.select('neoPrice'));
    this.connect('gasPrice', this.globalState.select('gasPrice'));
    this.connect('candyPrice', this.globalState.select('candyPrice'));
  }

  connectWallet(): void {
    this.globalState.connect(
      'address',
      this.neoline.getAccount().pipe(map((v) => v.address))
    );
  }
}
