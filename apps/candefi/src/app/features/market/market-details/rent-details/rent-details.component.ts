import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { CandefiToken } from '../../../../services/candefi.service';
import {
  RentfuseService,
  TokenDetails,
} from '../../../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../../state/global.state';

interface RentDetailsState {
  token: TokenDetails;
  isLoading: boolean;
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

  constructor(
    private rentfuse: RentfuseService,
    private config: DynamicDialogConfig,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
  }

  formGroup: FormGroup = new FormGroup({});

  ngOnInit(): void {
    const token = this.config.data.token as TokenDetails;
    this.set({ token });
    this.formGroup = this.fb.group({
      duration: [token.minRentInMinutes / 24 / 60, Validators.required],
      agreement: [false, Validators.requiredTrue],
    });
  }

  startRenting(): void {
    const durationInMinutes = this.duration * 24 * 60;
    const token = this.get('token');
    const paymentAmount =
      token.gasPerMinute * Math.pow(10, 8) * durationInMinutes +
      token.collateral * Math.pow(10, 8);
    this.rentfuse
      .startRenting(
        this.globalState.get('address'),
        token.listingId,
        durationInMinutes,
        paymentAmount
      )
      .subscribe((res) => {
        this.ref.close();
        this.formGroup.reset();
        console.log(res);
      });
  }

  get duration(): number {
    return this.formGroup.get('duration')?.value;
  }
}
