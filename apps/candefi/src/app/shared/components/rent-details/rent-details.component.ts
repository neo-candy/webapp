import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../../environments/environment';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { combineLatest, of, Subject } from 'rxjs';
import { CandefiToken } from '../../../services/candefi.service';
import {
  RentfuseService,
  TokenWithListingOptionalRenting,
} from '../../../services/rentfuse.service';
import {
  GlobalState,
  GLOBAL_RX_STATE,
  Price,
} from '../../../state/global.state';
import {
  ProfitCalculatorComponent,
  ProfitCalculatorParams,
  TableValue,
} from '../profit-calculator/profit-calculator.component';
import { generateNumberArray } from '../../utils';
import { map, mergeMap, tap } from 'rxjs/operators';

interface RentDetailsState {
  token: TokenWithListingOptionalRenting;
  isLoading: boolean;
  displayConfirmBtn: boolean;
  cols: number[];
  values: TableValue[];
}

@Component({
  templateUrl: './rent-details.component.html',
})
export class RentDetailsComponent
  extends RxState<RentDetailsState>
  implements OnInit
{
  readonly state$ = this.select();
  readonly onToken$ = new Subject<CandefiToken>();
  readonly txExplorer = environment.testnet.txExplorer;
  constructor(
    private rentfuse: RentfuseService,
    private config: DynamicDialogConfig,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
  }

  form: FormGroup = new FormGroup({});

  ngOnInit(): void {
    const token = this.config.data.token as TokenWithListingOptionalRenting;
    this.set({ token });
    const minDay = token.listing.minMinutes / 60 / 24;
    this.set({ cols: generateNumberArray(minDay, minDay + 9) });
    this.form = this.fb.group({
      duration: [null, Validators.required],
      agreement: [false, Validators.requiredTrue],
    });
    this.set({
      displayConfirmBtn: token.writer !== this.globalState.get('address'),
    });

    const params = this.mapToProfitCalculatorParams(token);
    this.connect(
      'values',
      of(params).pipe(
        mergeMap((params) =>
          combineLatest([
            this.globalState.select('gasPrice'),
            this.globalState.select('candyPrice'),
          ]).pipe(
            map((prices: [Price, Price]) =>
              ProfitCalculatorComponent.mapToTableValues(
                params,
                prices[0].curr,
                prices[1].curr
              )
            )
          )
        )
      )
    );
  }

  startRenting(): void {
    const durationInMinutes = this.duration.value * 24 * 60;
    const token = this.get('token');
    const paymentAmount = Math.round(
      token.listing.gasPerMinute * Math.pow(10, 8) * durationInMinutes +
        token.listing.collateral * Math.pow(10, 8)
    );
    this.rentfuse
      .startRenting(
        this.globalState.get('address'),
        token.listing.listingId,
        durationInMinutes,
        paymentAmount
      )
      .subscribe(() => {
        this.ref.close(true);
        this.form.reset();
      });
  }

  get duration(): AbstractControl {
    const control = this.form.get('duration');
    if (control === null) {
      throw new Error('duration_noControl');
    }
    return control;
  }

  openDetailsPage(): void {
    window.open('/tokens/' + atob(this.get('token').tokenId), '_blank');
  }

  private mapToProfitCalculatorParams(
    token: TokenWithListingOptionalRenting
  ): ProfitCalculatorParams {
    const profitCalculatorParams: ProfitCalculatorParams = {
      dailyFee: token.listing.gasPerMinute * 60 * 24,
      final: true,
      fromDays: token.listing.minMinutes / 60 / 24,
      toDays: token.listing.maxMinutes / 60 / 24,
      strike: token.strike,
      fromStrike: token.strike - 5 < 1 ? 1 : token.strike - 5,
      toStrike: token.strike + 5,
      initialValue: token.leverage > 0 ? token.value : token.stake,
      isSafe: token.safe,
      leverage: token.leverage,
      seller: false,
      stake: token.stake,
      timeDecay: token.timeDecay,
      type: token.type === 'Call' ? 'call' : 'put',
    };
    return profitCalculatorParams;
  }
}
