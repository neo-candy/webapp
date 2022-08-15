import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { MenuItem, SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { distinctUntilChanged, map, tap, timeout } from 'rxjs/operators';
import {
  ContextService,
  LAST_VISITED_PROFILE_CTX_KEY,
} from '../services/context.service';
import { NeolineService } from '../services/neoline.service';
import { UiService } from '../services/ui.service';
import { GlobalState, GLOBAL_RX_STATE, Price } from '../state/global.state';
import { MintComponent } from './mint/mint.component';

interface MenuState {
  isLoading: boolean;
  address: string;
  neoPrice: Price;
  gasPrice: Price;
  candyPrice: Price;
  flmPrice: Price;
  adaPrice: Price;
  solPrice: Price;
  xrpPrice: Price;
  btcPrice: Price;
  ethPrice: Price;
  bnbPrice: Price;
  selectedWallet: string;
}

const DEFAULT_STATE: MenuState = {
  isLoading: false,
  address: '',
  neoPrice: { curr: 0, prev: 0 },
  gasPrice: { curr: 0, prev: 0 },
  candyPrice: { curr: 0, prev: 0 },
  flmPrice: { curr: 0, prev: 0 },
  adaPrice: { curr: 0, prev: 0 },
  solPrice: { curr: 0, prev: 0 },
  xrpPrice: { curr: 0, prev: 0 },
  bnbPrice: { curr: 0, prev: 0 },
  btcPrice: { curr: 0, prev: 0 },
  ethPrice: { curr: 0, prev: 0 },
  selectedWallet: '',
};
@Component({
  selector: 'cd-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: [DialogService],
})
export class MenuComponent extends RxState<MenuState> {
  readonly state$ = this.select();
  connectOptions: SelectItem[] = [
    {
      label: 'NeoLine',
      value: 'NeoLine',
    },
  ];

  items: MenuItem[] = [
    {
      label: 'Markets',
      icon: 'pi pi-list',
      routerLink: 'markets',
    },
    {
      label: 'About',
      icon: 'pi pi-question-circle',
    },

    {
      label: 'Profit Calculator',
      icon: 'pi pi-sliders-v',
    },
    {
      label: 'Contests',
      icon: 'pi pi-chart-line',
      routerLink: 'leaderboard',
      disabled: true,
    },
  ];

  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private ui: UiService,
    private neoline: NeolineService,
    private dialogService: DialogService,
    private router: Router,
    private context: ContextService
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.globalState.connect(
      'address',
      this.neoline.ACCOUNT_CHANGED_EVENT$.pipe(
        distinctUntilChanged(),
        tap(() => this.ui.displaySuccess('Account changed'))
      )
    );
    this.connect('address', this.globalState.select('address'));
    this.connect('neoPrice', this.globalState.select('neoPrice'));
    this.connect('gasPrice', this.globalState.select('gasPrice'));
    this.connect('candyPrice', this.globalState.select('candyPrice'));
    this.connect('btcPrice', this.globalState.select('btcPrice'));
    this.connect('ethPrice', this.globalState.select('ethPrice'));
    this.connect('solPrice', this.globalState.select('solPrice'));
    this.connect('adaPrice', this.globalState.select('adaPrice'));
    this.connect('bnbPrice', this.globalState.select('bnbPrice'));
    this.connect('xrpPrice', this.globalState.select('xrpPrice'));
    this.connect('flmPrice', this.globalState.select('flmPrice'));
  }

  connectWallet(): void {
    this.globalState.connect(
      'address',
      this.neoline.getAccount().pipe(
        map((v) => v.address),
        tap(() => this.ui.displaySuccess('Wallet connected'))
      )
    );
  }

  openGithub(): void {
    window.open('https://github.com/neo-candy/contracts', '_blank');
  }
  openDiscord(): void {
    window.open('https://discord.com/invite/7ssWUpvcfF', '_blank');
  }
  openTwitter(): void {
    window.open('https://twitter.com/NeoCandyN3', '_blank');
  }
  openNeoCandy(): void {
    window.open('https://neocandy.io', '_blank');
  }

  displayMintModal(): void {
    this.dialogService.open(MintComponent, {
      header: 'Mint NFT',
      width: '90%',
    });
  }

  goToProfile(): void {
    const target = this.context.get(LAST_VISITED_PROFILE_CTX_KEY) ?? 'listings';
    this.router.navigate(['profile/' + target]);
  }
}
