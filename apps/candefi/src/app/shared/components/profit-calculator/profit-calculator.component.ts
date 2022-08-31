import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GlobalState,
  GLOBAL_RX_STATE,
  Price,
} from '../../../state/global.state';

interface TableValue {
  strike: number;
  [day: number]: number;
}

interface QueryParams {
  stake: number;
  strike: number;
  fromDays: number;
  toDays: number;
  fromStrike: number;
  toStrike: number;
  isSafe: boolean;
  type: 'call' | 'put';
  gasPerDay: number;
  leverage: number;
  timeDecay: number;
  subtractFeeFromProfit: boolean;
  seller: boolean;
}

interface ProfitCalculatorState {
  isLoading: boolean;
  params: QueryParams;
  values: TableValue[];
  cols: number[];
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Component({
  selector: 'cd-profit-calculator',
  templateUrl: './profit-calculator.component.html',
  styleUrls: ['./profit-calculator.component.scss'],
})
export class ProfitCalculatorComponent extends RxState<ProfitCalculatorState> {
  readonly state$ = this.select();

  constructor(
    private route: ActivatedRoute,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set({ isLoading: true });
    this.connect(
      'params',
      this.route.queryParams.pipe(
        map((params) => ProfitCalculatorComponent.mapToQueryParams(params))
      )
    );
    this.connect(
      'cols',
      this.select('params').pipe(
        map((params) =>
          ProfitCalculatorComponent.generateNumberArray(
            params.fromDays,
            params.toDays
          )
        )
      )
    );
    this.connect(
      'values',
      combineLatest([
        this.select('params'),
        this.globalState.select('gasPrice'),
        this.globalState.select('candyPrice'),
      ]).pipe(
        map((params: [QueryParams, Price, Price]) =>
          this.mapToTableValues(params[0], params[1].curr, params[2].curr)
        )
      )
    );

    this.connect('isLoading', this.select('values').pipe(map(() => false)));
  }

  private static generateNumberArray(from: number, to: number): number[] {
    return Array.from({ length: to - from + 1 }, (_, i) => i + from);
  }

  private static mapToQueryParams(params: Params): QueryParams {
    return {
      stake: Number(params['stake']),
      strike: Number(params['strike']),
      fromDays: Number(params['fromDays']),
      toDays: Number(params['toDays']),
      fromStrike: Number(params['fromStrike']),
      toStrike: Number(params['toStrike']),
      isSafe: params['isSafe'] === 'true' ? true : false,
      type: params['type'],
      gasPerDay: Number(params['gasPerDay']),
      leverage: Number(params['leverage']),
      timeDecay: Number(params['timeDecay']),
      subtractFeeFromProfit: params['final'] == 'true' ? true : false,
      seller: params['seller'] == 'true' ? true : false,
    };
  }

  private mapToTableValues(
    params: QueryParams,
    gasPrice: number,
    candyPrice: number
  ): TableValue[] {
    const result: TableValue[] = [];
    const cols: number[] = ProfitCalculatorComponent.generateNumberArray(
      params.fromDays,
      params.toDays
    );
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

  private calculateValue(
    params: QueryParams,
    columnDay: number,
    rowStrike: number,
    gasPrice: number,
    candyPrice: number
  ): number {
    const gasFee = params.gasPerDay * columnDay * gasPrice;
    const timeDecay = params.timeDecay * MS_PER_DAY * columnDay;
    const candyStakeWithTimeDecayMalus =
      (params.stake * Math.pow(10, 9) - timeDecay) / Math.pow(10, 9);
    const leverage =
      (params.leverage * ((rowStrike - params.strike) * Math.pow(10, 8))) /
      Math.pow(10, 9);
    const candyValue = (candyStakeWithTimeDecayMalus + leverage) * candyPrice;

    let result = 0;

    if (params.type === 'call') {
      if (params.isSafe) {
        if (params.strike <= rowStrike) {
          result = candyValue - (params.subtractFeeFromProfit ? gasFee : 0);
        } else {
          result = -gasFee;
        }
      } else {
        result = candyValue - (params.subtractFeeFromProfit ? gasFee : 0);
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
    return result;
  }
}
