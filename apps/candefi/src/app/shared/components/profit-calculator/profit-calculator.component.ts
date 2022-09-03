import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { SelectItem } from 'primeng/api';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  CALCULATOR_ADVANCED_COLLAPSED_CTX_KEY,
  CALCULATOR_SETTINGS_COLLAPSED_CTX_KEY,
  ContextService,
} from '../../../services/context.service';
import {
  GlobalState,
  GLOBAL_RX_STATE,
  Price,
} from '../../../state/global.state';
import { generateNumberArray } from '../../utils';

export interface TableValue {
  strike: number;
  [day: number]: number;
}

export interface ProfitCalculatorParams {
  stake: number;
  initialValue: number;
  strike: number;
  fromDays: number;
  toDays: number;
  fromStrike: number;
  toStrike: number;
  isSafe: boolean;
  type: 'call' | 'put';
  dailyFee: number;
  leverage: number;
  timeDecay: number;
  final: boolean;
  seller: boolean;
  expectedCandyPrice?: number;
}

interface ProfitCalculatorState {
  isLoading: boolean;
  params: ProfitCalculatorParams;
  values: TableValue[];
  cols: number[];
  marketOptions: SelectItem[];
  settingsCollapsed: boolean;
  advancedSettingsCollapsed: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'cd-profit-calculator',
  templateUrl: './profit-calculator.component.html',
  styleUrls: ['./profit-calculator.component.scss'],
})
export class ProfitCalculatorComponent extends RxState<ProfitCalculatorState> {
  readonly state$ = this.select();

  form: FormGroup = new FormGroup({});
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private context: ContextService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set({ isLoading: true });
    this.set({
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
    });
    this.set({
      settingsCollapsed:
        this.context.get(CALCULATOR_SETTINGS_COLLAPSED_CTX_KEY) == 'true'
          ? true
          : false,
    });
    this.set({
      advancedSettingsCollapsed:
        this.context.get(CALCULATOR_ADVANCED_COLLAPSED_CTX_KEY) == 'true'
          ? true
          : false,
    });

    this.connect(
      'params',
      this.route.queryParams.pipe(
        tap(() => this.set({ isLoading: true })),
        map((params) => ProfitCalculatorComponent.mapToQueryParams(params)),
        tap((params) => this.initializeForm(params))
      )
    );
    this.connect(
      'cols',
      this.select('params').pipe(
        map((params) => generateNumberArray(params.fromDays, params.toDays))
      )
    );
    this.connect(
      'values',
      combineLatest([
        this.select('params'),
        this.globalState.select('gasPrice'),
        this.globalState.select('candyPrice'),
      ]).pipe(
        map((params: [ProfitCalculatorParams, Price, Price]) =>
          ProfitCalculatorComponent.mapToTableValues(
            params[0],
            params[1].curr,
            params[2].curr
          )
        )
      )
    );
    this.connect('isLoading', this.select('values').pipe(map(() => false)));
  }

  public static mapToTableValues(
    params: ProfitCalculatorParams,
    gasPrice: number,
    candyPrice: number
  ): TableValue[] {
    const result: TableValue[] = [];
    const cols: number[] = generateNumberArray(params.fromDays, params.toDays);
    for (let i = params.toStrike; i >= params.fromStrike; i--) {
      const calculations = cols.reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: this.calculateValue(params, curr, i, gasPrice, candyPrice),
        }),
        {}
      );
      result.push({ strike: i, ...calculations });
    }
    return result;
  }

  public static calculateValue(
    params: ProfitCalculatorParams,
    columnDay: number,
    rowStrike: number,
    gasPrice: number,
    candyPrice: number
  ): number {
    candyPrice = params.expectedCandyPrice ?? candyPrice;
    const gasFee = params.dailyFee * columnDay * gasPrice;
    const timeDecay = params.timeDecay * MS_PER_DAY * columnDay;
    const candyStakeWithTimeDecayMalus =
      (params.initialValue * Math.pow(10, 9) - timeDecay) / Math.pow(10, 9);
    const priceDelta =
      params.type === 'call'
        ? rowStrike - params.strike
        : params.strike - rowStrike;
    const leverage =
      (params.leverage * (priceDelta * Math.pow(10, 8))) / Math.pow(10, 9);
    const candyValue = (candyStakeWithTimeDecayMalus + leverage) * candyPrice;

    let result = 0;

    if (params.type === 'call') {
      if (params.isSafe) {
        if (params.strike <= rowStrike) {
          result = candyValue - (params.final ? gasFee : 0);
        } else {
          result = -gasFee;
        }
      } else {
        result = candyValue - (params.final ? gasFee : 0);
      }
    } else if (params.type === 'put') {
      if (params.isSafe) {
        if (params.strike >= rowStrike) {
          result = candyValue - (params.final ? gasFee : 0);
        } else {
          result = -gasFee;
        }
      } else {
        result = candyValue - (params.final ? gasFee : 0);
      }
    }
    const maxValue = params.stake * candyPrice;
    const minValue = -gasFee;
    if (result > maxValue) {
      result = maxValue;
    }
    if (result < minValue) {
      result = minValue;
    }
    return params.seller ? result * -1 : result;
  }

  private static mapToQueryParams(params: Params): ProfitCalculatorParams {
    const strike = isNaN(params['strike']) ? 10 : Number(params['strike']);
    return {
      stake: isNaN(params['stake']) ? 50000 : Number(params['stake']),
      initialValue: isNaN(params['initialValue'])
        ? 50000
        : Number(params['initialValue']),
      strike: strike,
      fromDays: isNaN(params['fromDays']) ? 1 : Number(params['fromDays']),
      toDays: isNaN(params['toDays']) ? 10 : Number(params['toDays']),
      fromStrike: isNaN(params['fromStrike'])
        ? strike - 5 < 1
          ? 1
          : strike - 5
        : Number(params['fromStrike']),
      toStrike: isNaN(params['toStrike'])
        ? strike + 5
        : Number(params['toStrike']),
      isSafe: params['isSafe'] === 'false' ? false : true,
      type: params['type'] == 'put' ? 'put' : 'call',
      dailyFee: isNaN(params['dailyFee']) ? 0.5 : Number(params['dailyFee']),
      leverage: isNaN(params['leverage']) ? 0 : Number(params['leverage']),
      timeDecay: isNaN(params['timeDecay']) ? 0 : Number(params['timeDecay']),
      final: params['final'] == 'false' ? false : true,
      seller: params['seller'] == 'true' ? true : false,
      expectedCandyPrice: isNaN(params['expectedCandyPrice'])
        ? undefined
        : Number(params['expectedCandyPrice']),
    };
  }

  private initializeForm(params: ProfitCalculatorParams): void {
    this.form = this.fb.group({
      duration: [[params.fromDays, params.toDays]],
      strikeRange: [[params.fromStrike, params.toStrike]],
      dailyFee: [params.dailyFee],
      stake: [params.stake],
      strike: [params.strike],
      type: [params.type],
      seller: [params.seller],
      safe: [params.isSafe],
      final: [params.final],
      leverage: [params.leverage],
      timeDecay: [params.timeDecay],
      initialValue: [params.initialValue],
      market: ['neo'],
      expectedCandyPrice: [params.expectedCandyPrice],
      realTime: [params.expectedCandyPrice ? false : true],
    });

    if (!params.expectedCandyPrice) {
      this.expectedCandyPrice.disable();
    }
    this.hold(this.realTime.valueChanges, (v) => {
      if (v === true) {
        this.expectedCandyPrice.setValue(undefined);
        this.expectedCandyPrice.disable();
      } else {
        this.expectedCandyPrice.enable();
        this.expectedCandyPrice.setValue(
          this.globalState.get('candyPrice').curr
        );
      }
    });
  }

  onSettingsToggled(collapsed: boolean): void {
    this.context.put(CALCULATOR_SETTINGS_COLLAPSED_CTX_KEY, String(collapsed));
  }

  onAdvancedSettingsToggled(collapsed: boolean): void {
    this.context.put(CALCULATOR_ADVANCED_COLLAPSED_CTX_KEY, String(collapsed));
  }

  calculate(): void {
    if (this.leverage.value === 0) {
      this.initialValue.setValue(this.stake.value);
    }
    const queryParams: ProfitCalculatorParams = {
      dailyFee: this.dailyFee.value,
      fromDays: this.duration.value[0],
      toDays: this.duration.value[1],
      fromStrike: this.strikeRange.value[0],
      toStrike: this.strikeRange.value[1],
      initialValue:
        this.leverage.value > 0 ? this.initialValue.value : this.stake.value,
      isSafe: Boolean(this.safe.value),
      leverage: this.leverage.value,
      seller: Boolean(this.seller.value),
      stake: this.stake.value,
      strike: this.strike.value,
      final: this.final.value,
      timeDecay: this.timeDecay.value,
      type: this.type.value,
      expectedCandyPrice: this.expectedCandyPrice.value,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
    });
  }

  get market(): AbstractControl {
    const control = this.form.get('market');
    if (control === null) {
      throw new Error('market_noControl');
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

  get strike(): AbstractControl {
    const control = this.form.get('strike');
    if (control === null) {
      throw new Error('strike_noControl');
    }
    return control;
  }

  get expectedCandyPrice(): AbstractControl {
    const control = this.form.get('expectedCandyPrice');
    if (control === null) {
      throw new Error('expectedCandyPrice_noControl');
    }
    return control;
  }

  get strikeRange(): AbstractControl {
    const control = this.form.get('strikeRange');
    if (control === null) {
      throw new Error('strikeRange_noControl');
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

  get seller(): AbstractControl {
    const control = this.form.get('seller');
    if (control === null) {
      throw new Error('seller_noControl');
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

  get final(): AbstractControl {
    const control = this.form.get('final');
    if (control === null) {
      throw new Error('final_noControl');
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

  get timeDecay(): AbstractControl {
    const control = this.form.get('timeDecay');
    if (control === null) {
      throw new Error('timeDecay_noControl');
    }
    return control;
  }

  get initialValue(): AbstractControl {
    const control = this.form.get('initialValue');
    if (control === null) {
      throw new Error('initialValue_noControl');
    }
    return control;
  }

  get realTime(): AbstractControl {
    const control = this.form.get('realTime');
    if (control === null) {
      throw new Error('realTime_noControl');
    }
    return control;
  }
}
