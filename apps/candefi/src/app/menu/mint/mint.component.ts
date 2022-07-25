import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { MenuItem, SelectItem } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { map } from 'rxjs/operators';
import { CandefiService } from '../../services/candefi.service';
import {
  ContextService,
  SELECTED_MINT_MARKET,
  SELECTED_MINT_TYPE,
} from '../../services/context.service';
import { initialValueReqLeverageValidator } from '../../shared/validators/initial-value.directive';
import { minCollateralValidator } from '../../shared/validators/min-collateral.directive';
import { MinStakeValidator } from '../../shared/validators/min-stake.directive';
import { nonZeroValidator } from '../../shared/validators/non-zero.directive';
import { safeLeverageValidator } from '../../shared/validators/safe-leverage.directive';
import { strikePriceValidator } from '../../shared/validators/strike-price.directive';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

interface MintState {
  protocolFee: number;
  minStake: number;
  steps: MenuItem[];
  activeMenuIndex: number;
  marketOptions: SelectItem[];
  typeOptions: SelectItem[];
  collateralOptions1: SelectItem[];
  collateralOptions2: SelectItem[];
}

const DEFAULT_STATE: MintState = {
  protocolFee: 0,
  minStake: 0,
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
  typeOptions: [
    { label: 'Call', value: 'call' },
    { label: 'Put', value: 'put' },
  ],
  collateralOptions1: [
    { label: '200%', value: '200' },
    { label: '250%', value: '250' },
    { label: '300%', value: '300' },
    { label: '350%', value: '350' },
  ],
  collateralOptions2: [
    { label: '400%', value: '400' },
    { label: '450%', value: '450' },
    { label: '500%', value: '500' },
    { label: '550%', value: '550' },
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
  constructor(
    private fb: FormBuilder,
    private candefi: CandefiService,
    private context: ContextService,
    public ref: DynamicDialogRef,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.connect(
      'protocolFee',
      this.candefi
        .candyProtocolFee()
        .pipe(map((fee) => (fee /= Math.pow(10, 9))))
    );
    this.connect(
      'minStake',
      this.candefi.minStake().pipe(map((v) => (v /= Math.pow(10, 9))))
    );
    this.set(DEFAULT_STATE);
    this.set({
      steps: [
        { label: 'General' },
        { label: 'Renting' },
        { label: 'Confirmation' },
      ],
    });

    this.hold(this.select('minStake'), (v) => {
      this.form.patchValue({ stake: v });
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        type: [this.context.get(SELECTED_MINT_TYPE) ?? 'call'],
        market: [this.context.get(SELECTED_MINT_MARKET) ?? 'neo'],
        strike: [
          Math.round(this.globalState.get('neoPrice').curr),
          Validators.compose([Validators.required, nonZeroValidator()]),
        ],
        stake: [
          0,
          [Validators.required],
          [MinStakeValidator.createValidator(this.candefi)],
        ],
        timeDecay: [0, Validators.required],
        value: [0, Validators.required],
        leverage: [0, Validators.required],
        safe: [true],
        agreement: [true, Validators.requiredTrue],
        duration: [[1, 28]],
        dailyFee: [0.01, Validators.required],
        collateral: [0.01, Validators.required],
        collateralOption1: ['300'],
        collateralOption2: [null],
      },
      {
        validators: [
          safeLeverageValidator(),
          initialValueReqLeverageValidator(),
          strikePriceValidator(this.globalState.get('neoPrice').curr),
          minCollateralValidator(
            this.globalState.get('candyPrice').curr,
            this.globalState.get('gasPrice').curr
          ),
        ],
      }
    );

    if (this.type.value === 'call') {
      this.strike.setValue(
        Math.ceil(this.globalState.get('neoPrice').curr + 2)
      );
    } else {
      this.strike.setValue(
        Math.floor(this.globalState.get('neoPrice').curr - 2)
      );
    }

    this.registerValueChanges();
  }

  get market(): AbstractControl {
    const control = this.form.get('market');
    if (control === null) {
      throw new Error('market_noControl');
    }
    return control;
  }

  get stake(): AbstractControl {
    const control = this.form.get('stake');
    if (control === null) {
      throw new Error('stake_noControl');
    }
    return control;
  }

  get type(): AbstractControl {
    const control = this.form.get('type');
    if (control === null) {
      throw new Error('type_noControl');
    }
    return control;
  }

  get strike(): AbstractControl {
    const control = this.form.get('strike');
    if (control === null) {
      throw new Error('strike_noControl');
    }
    return control;
  }

  get timeDecay(): AbstractControl {
    const control = this.form.get('timeDecay');
    if (control === null) {
      throw new Error('timeDecay_noControl');
    }
    return control;
  }

  get leverage(): AbstractControl {
    const control = this.form.get('leverage');
    if (control === null) {
      throw new Error('leverage_noControl');
    }
    return control;
  }

  get value(): AbstractControl {
    const control = this.form.get('value');
    if (control === null) {
      throw new Error('value_noControl');
    }
    return control;
  }

  get agreement(): AbstractControl {
    const control = this.form.get('agreement');
    if (control === null) {
      throw new Error('agreement_noControl');
    }
    return control;
  }

  get duration(): AbstractControl {
    const control = this.form.get('duration');
    if (control === null) {
      throw new Error('duration_noControl');
    }
    return control;
  }

  get dailyFee(): AbstractControl {
    const control = this.form.get('dailyFee');
    if (control === null) {
      throw new Error('dailyFee_noControl');
    }
    return control;
  }

  get collateral(): AbstractControl {
    const control = this.form.get('collateral');
    if (control === null) {
      throw new Error('collateral_noControl');
    }
    return control;
  }

  get safe(): AbstractControl {
    const control = this.form.get('safe');
    if (control === null) {
      throw new Error('safe_noControl');
    }
    return control;
  }

  get collateralOption1(): AbstractControl {
    const control = this.form.get('collateralOption1');
    if (control === null) {
      throw new Error('collateralOption1_noControl');
    }
    return control;
  }

  get collateralOption2(): AbstractControl {
    const control = this.form.get('collateralOption2');
    if (control === null) {
      throw new Error('collateralOption2_noControl');
    }
    return control;
  }

  goToNextPage(): void {
    const newIndex = this.get('activeMenuIndex') + 1;
    this.set({ activeMenuIndex: newIndex });
    const lastStep = this.get('steps').length - 1;
    if (newIndex === lastStep) {
      this.agreement.setValue(false);
    }
  }

  goToPrevPage(): void {
    const newIndex = this.get('activeMenuIndex') - 1;
    this.set({ activeMenuIndex: newIndex });
    this.agreement.setValue(true);
  }

  mint(): void {
    const stake = this.stake.value * Math.pow(10, 9);
    const strike = this.strike.value * Math.pow(10, 8);
    const minMinutes = this.duration.value[0] * 24 * 60;
    const maxMinutes = this.duration.value[1] * 24 * 60;
    const feePerMinute = Math.round(
      (this.dailyFee.value * Math.pow(10, 8)) / 24 / 60
    );
    const collateral = this.collateral.value * Math.pow(10, 8);
    const value =
      this.leverage.value === 0 ? stake : this.value.value * Math.pow(10, 9);
    this.candefi
      .mint(
        this.globalState.get('address'),
        this.type.value === 'call' ? 'Call' : 'Put',
        strike,
        stake,
        this.timeDecay.value,
        value,
        this.leverage.value,
        this.safe.value,
        collateral,
        minMinutes,
        maxMinutes,
        feePerMinute
      )
      .subscribe((txid) => {
        console.log(txid);
        this.ref.close();
      });
  }

  private setCollateral(percent: number): void {
    const stakeValue =
      this.stake.value * this.globalState.get('candyPrice').curr;
    const collateral =
      ((stakeValue / this.globalState.get('gasPrice').curr) * percent) / 100;
    this.collateral.patchValue(collateral);
  }

  private registerValueChanges(): void {
    this.hold(this.form.controls['type'].valueChanges, (v) => {
      this.context.put(SELECTED_MINT_TYPE, v);
    });
    this.hold(this.form.controls['market'].valueChanges, (v) => {
      this.context.put(SELECTED_MINT_MARKET, v);
    });

    this.hold(this.form.controls['collateralOption1'].valueChanges, (v) => {
      if (v) {
        this.setCollateral(Number(v));
        if (this.collateralOption2.value) {
          this.collateralOption2.reset();
        }
      }
    });
    this.hold(this.form.controls['collateralOption2'].valueChanges, (v) => {
      if (v) {
        this.setCollateral(Number(v));
        if (this.collateralOption1.value) {
          this.collateralOption1.reset();
        }
      }
    });
    this.hold(this.form.controls['stake'].valueChanges, () => {
      if (this.collateralOption1.value) {
        this.setCollateral(Number(this.collateralOption1.value));
      } else if (this.collateralOption2.value) {
        this.setCollateral(Number(this.collateralOption2.value));
      }
    });
  }
}
