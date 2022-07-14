import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { MenuItem, SelectItem } from 'primeng/api';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { CandefiService } from '../services/candefi.service';
import { NeolineService } from '../services/neoline.service';
import { UiService } from '../services/ui.service';
import { GlobalState, GLOBAL_RX_STATE, Price } from '../state/global.state';

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
  displayMintModal: boolean;
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
  displayMintModal: false,
  selectedWallet: '',
};
@Component({
  selector: 'cd-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent extends RxState<MenuState> implements OnInit {
  readonly state$ = this.select();
  form: FormGroup = new FormGroup({});
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
      label: 'Leaderboard',
      icon: 'pi pi-chart-line',
      routerLink: 'leaderboard',
    },
  ];

  constructor(
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>,
    private ui: UiService,
    private neoline: NeolineService,
    private fb: FormBuilder,
    private candefi: CandefiService
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

  ngOnInit(): void {
    this.form = this.fb.group({
      type: [{ value: 'Call', disabled: true }],
      asset: [{ value: 'NEO', disabled: true }],
      strike: [0, Validators.required],
      stake: [5000, Validators.required],
      fee: [{ value: 1000, disabled: true }],
      depreciation: [0],
      value: [0],
      volatility: [0],
      safe: [false],
      agreement: [false, Validators.requiredTrue],
      duration: [[1, 28]],
      dailyFee: [0.01],
      collateral: [0.01],
    });
  }

  displayMintCallModal(): void {
    this.form.patchValue({
      type: 'Call',
      strike: Math.ceil(this.globalState.get('neoPrice').curr + 0.5),
      value: this.stake / 2,
    });
    this.set({ displayMintModal: true });
  }

  displayMintPutModal(): void {
    this.form.patchValue({
      type: 'Put',
      strike: Math.floor(this.globalState.get('neoPrice').curr - 0.5),
      value: this.stake / 2,
    });
    this.set({ displayMintModal: true });
  }

  mint(): void {
    if (this.type == 'Call') {
      this.mintCall();
    } else if (this.type == 'Put') {
      this.mintPut();
    }
  }

  get stake(): number {
    return this.form.get('stake')?.value;
  }

  get type(): string {
    return this.form.get('type')?.value;
  }

  get strike(): number {
    return this.form.get('strike')?.value;
  }

  get depreciation(): number {
    return this.form.get('depreciation')?.value;
  }

  get volatility(): number {
    return this.form.get('volatility')?.value;
  }

  get value(): number {
    return this.form.get('value')?.value;
  }

  get safe(): boolean {
    return this.form.get('safe')?.value;
  }

  get duration(): number[] {
    return this.form.get('duration')?.value;
  }

  get dailyFee(): number {
    return this.form.get('dailyFee')?.value;
  }

  get collateral(): number {
    return this.form.get('collateral')?.value;
  }

  private mintCall(): void {
    const stake = this.stake * Math.pow(10, 9);
    const strike = this.strike * Math.pow(10, 8);
    const value = this.value * Math.pow(10, 9);
    const minMinutes = this.duration[0] * 24 * 60;
    const maxMinutes = this.duration[1] * 24 * 60;
    const feePerMinute = Math.round(
      (this.dailyFee * Math.pow(10, 8)) / 24 / 60
    );
    const collateral = this.collateral * Math.pow(10, 8);

    this.candefi
      .mintCall(
        this.get('address'),
        strike,
        stake,
        this.depreciation,
        value,
        this.volatility,
        this.safe,
        collateral,
        minMinutes,
        maxMinutes,
        feePerMinute
      )
      .subscribe((txid) => {
        this.set({ displayMintModal: false });
        //this.refreshWriterTokens();
        console.log(txid);
      });
  }

  private mintPut(): void {
    const stake = this.stake * Math.pow(10, 9);
    const strike = this.strike * Math.pow(10, 8);
    const value = this.value * Math.pow(10, 9);
    const minDurationInMinutes = this.duration[0] * 24 * 60;
    const maxDurationInMinutes = this.duration[1] * 24 * 60;
    const feePerMinute = Math.round(
      (this.dailyFee * Math.pow(10, 8)) / 24 / 60
    );
    const collateral = this.collateral * Math.pow(10, 8);
    this.candefi
      .mintPut(
        this.get('address'),
        strike,
        stake,
        this.depreciation,
        value,
        this.volatility,
        this.safe,
        collateral,
        minDurationInMinutes,
        maxDurationInMinutes,
        feePerMinute
      )
      .subscribe((txid) => {
        this.set({ displayMintModal: false });
        console.log(txid);
      });
  }
}
