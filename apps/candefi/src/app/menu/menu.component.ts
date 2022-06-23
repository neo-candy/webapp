import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { MenuItem } from 'primeng/api';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { CandefiService } from '../services/candefi.service';
import { NeolineService } from '../services/neoline.service';
import { UiService } from '../services/ui.service';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';

interface MenuState {
  isLoading: boolean;
  address: string;
  neoPrice: number;
  gasPrice: number;
  candyPrice: number;
  displayMintModal: boolean;
}

const DEFAULT_STATE: MenuState = {
  isLoading: false,
  address: '',
  neoPrice: 0,
  gasPrice: 0,
  candyPrice: 0,
  displayMintModal: false,
};
@Component({
  selector: 'cd-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent extends RxState<MenuState> implements OnInit {
  readonly state$ = this.select();
  form: FormGroup = new FormGroup({});

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
      vdot: [0],
      value: [0],
      vi: [0],
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
      strike: Math.ceil(this.globalState.get('neoPrice') + 0.5),
      value: this.stake / 2,
    });
    this.set({ displayMintModal: true });
  }

  displayMintPutModal(): void {
    this.form.patchValue({
      type: 'Put',
      strike: Math.floor(this.globalState.get('neoPrice') - 0.5),
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

  get vdot(): number {
    return this.form.get('vdot')?.value;
  }

  get vi(): number {
    return this.form.get('vi')?.value;
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
    const minDurationInMinutes = this.duration[0] * 24 * 60;
    const maxDurationInMinutes = this.duration[1] * 24 * 60;
    const feePerMinute = (this.dailyFee * Math.pow(10, 8)) / 24 / 60;
    const collateral = this.collateral * Math.pow(10, 8);
    this.candefi
      .mintCall(
        this.get('address'),
        strike,
        stake,
        this.vdot,
        value,
        this.vi,
        this.safe,
        collateral,
        minDurationInMinutes,
        maxDurationInMinutes,
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
    const feePerMinute = (this.dailyFee * Math.pow(10, 8)) / 24 / 60;
    const collateral = this.collateral * Math.pow(10, 8);
    this.candefi
      .mintPut(
        this.get('address'),
        strike,
        stake,
        this.vdot,
        value,
        this.vi,
        this.safe,
        collateral,
        minDurationInMinutes,
        maxDurationInMinutes,
        feePerMinute
      )
      .subscribe((txid) => {
        this.set({ displayMintModal: false });
        //this.refreshWriterTokens();
        console.log(txid);
      });
  }

  /* private refreshWriterTokens(): void {
    this.set({ isLoadingWriter: true });
    this.fetchWriterTokens$(this.get('address')).subscribe((res) =>
      this.set({ writer: res })
    );
  } */
}
