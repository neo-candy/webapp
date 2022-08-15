import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { CandefiToken } from '../../../../services/candefi.service';
import {
  RentfuseService,
  TokenWithListingOptionalRenting,
} from '../../../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../../state/global.state';

interface RentDetailsState {
  token: TokenWithListingOptionalRenting;
  isLoading: boolean;
  displayConfirmBtn: boolean;
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
    const token = this.config.data.token as TokenWithListingOptionalRenting;
    this.set({ token });
    this.formGroup = this.fb.group({
      duration: [null, Validators.required],
      agreement: [false, Validators.requiredTrue],
    });
    this.set({
      displayConfirmBtn: token.writer !== this.globalState.get('address'),
    });
  }

  startRenting(): void {
    const durationInMinutes = this.duration * 24 * 60;
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
        this.formGroup.reset();
      });
  }

  get duration(): number {
    return this.formGroup.get('duration')?.value;
  }

  openDetailsPage(): void {
    window.open('/tokens/' + atob(this.get('token').tokenId), '_blank');
  }
}
