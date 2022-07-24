import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { MenuItem, SelectItem } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { CandefiService } from '../../services/candefi.service';
import {
  ContextService,
  SELECTED_MINT_MARKET,
  SELECTED_MINT_TYPE,
} from '../../services/context.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

interface MintState {
  protocolFee: number;
  steps: MenuItem[];
  activeMenuIndex: number;
  marketOptions: SelectItem[];
  selectBtnOptions: SelectItem[];
}

const DEFAULT_STATE: MintState = {
  protocolFee: 0,
  steps: [],
  activeMenuIndex: 0,
  marketOptions: [
    { label: 'NEO', value: 'neo' },
    { label: 'GAS', value: 'gas', disabled: true },
    { label: 'FLM', value: 'flm', disabled: true },
    { label: 'BTC', value: 'btc', disabled: true },
    { label: 'ETH', value: 'eth', disabled: true },
    { label: 'BNB', value: 'bnb', disabled: true },
    { label: 'ADA', value: 'ada', disabled: true },
    { label: 'SOL', value: 'sol', disabled: true },
    { label: 'XRP', value: 'xrp', disabled: true },
  ],
  selectBtnOptions: [
    { label: 'Call', value: 'call' },
    { label: 'Put', value: 'put' },
  ],
};

@Component({
  selector: 'cd-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent extends RxState<MintState> implements OnInit {
  form: FormGroup = new FormGroup({});
  readonly state$ = this.select();
  onMarketChange$: Observable<string> = of();
  onTypeChange$: Observable<string> = of();
  constructor(
    private fb: FormBuilder,
    private candefi: CandefiService,
    private context: ContextService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.connect('protocolFee', this.candefi.candyProtocolFee());
    this.set(DEFAULT_STATE);
    this.set({
      steps: [
        { label: 'Template' },
        { label: 'Renting' },
        { label: 'Additional' },
        { label: 'Confirmation' },
      ],
    });
    this.hold(this.onMarketChange$, (v) =>
      this.context.put(SELECTED_MINT_MARKET, v)
    );
    this.hold(this.onTypeChange$, (v) =>
      this.context.put(SELECTED_MINT_TYPE, v)
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      type: [this.context.get(SELECTED_MINT_TYPE) ?? 'call'],
      market: [this.context.get(SELECTED_MINT_MARKET) ?? 'neo'],
      strike: [0, Validators.required],
      stake: [5000, Validators.required],
      fee: [{ value: this.get('protocolFee'), disabled: true }],
      timeDecay: [0],
      value: [0],
      leverage: [0],
      safe: [false],
      agreement: [false, Validators.requiredTrue],
      duration: [[1, 28]],
      dailyFee: [0.01],
      collateral: [0.01],
    });

    this.onMarketChange$ = this.form.controls['market'].valueChanges;
    this.onTypeChange$ = this.form.controls['type'].valueChanges;

    /* if (type === 'Call') {
      this.form.patchValue({
        type,
        strike: Math.ceil(this.globalState.get('neoPrice').curr + 0.5),
        value: this.stake / 2,
      });
    } else {
      this.form.patchValue({
        type,
        strike: Math.floor(this.globalState.get('neoPrice').curr - 0.5),
        value: this.stake / 2,
      });
    } */
  }

  get market(): string {
    return this.form.get('market')?.value;
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

  get timeDecay(): number {
    return this.form.get('timeDecay')?.value;
  }

  get leverage(): number {
    return this.form.get('leverage')?.value;
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

  mint(): void {
    if (this.type == 'Call') {
      this.mintCall();
    } else if (this.type == 'Put') {
      this.mintPut();
    }
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
        this.globalState.get('address'),
        strike,
        stake,
        this.timeDecay,
        value,
        this.leverage,
        this.safe,
        collateral,
        minMinutes,
        maxMinutes,
        feePerMinute
      )
      .subscribe((txid) => {
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
        this.globalState.get('address'),
        strike,
        stake,
        this.timeDecay,
        value,
        this.leverage,
        this.safe,
        collateral,
        minDurationInMinutes,
        maxDurationInMinutes,
        feePerMinute
      )
      .subscribe((txid) => {
        console.log(txid);
      });
  }
}
