import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { from, Subject } from 'rxjs';
import { finalize, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { CandefiToken } from '../../../../services/candefi.service';
import { NeolineService } from '../../../../services/neoline.service';
import {
  RentfuseService,
  TokenDetails,
} from '../../../../services/rentfuse.service';
import { UiService } from '../../../../services/ui.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../../state/global.state';

interface MarketDetailsState {
  tokens: TokenDetails[];
  isLoading: boolean;
  displayRentModal: boolean;
  selectedNft?: TokenDetails;
}

const DEFAULT_STATE: MarketDetailsState = {
  tokens: [],
  isLoading: true,
  displayRentModal: false,
};

@Component({
  templateUrl: './market-details.component.html',
  styleUrls: ['./market-details.component.scss'],
  providers: [DialogService],
})
export class MarketDetailsComponent
  extends RxState<MarketDetailsState>
  implements OnInit
{
  readonly state$ = this.select();
  readonly onToken$ = new Subject<CandefiToken>();

  constructor(
    private config: DynamicDialogConfig,
    private rentfuse: RentfuseService,
    private neoline: NeolineService,
    private ui: UiService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    from(this.config.data.tokens as CandefiToken[])
      .pipe(
        mergeMap((token: CandefiToken) =>
          this.rentfuse.getListingForToken(token)
        ),
        toArray(),
        finalize(() => this.set({ isLoading: false }))
      )
      .subscribe((res) => {
        this.set({ tokens: res });
      });
  }

  formGroup: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      duration: [1, Validators.required],
    });
  }

  startRenting(token: TokenDetails, days: number): void {
    if (!this.globalState.get('address')) {
      this.connectWallet();
    } else {
      const durationInMinutes = days * 24 * 60;
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
        .subscribe((res) => console.log(res));
    }
  }

  displayRentModal(token: TokenDetails): void {
    this.dialogService.open(MarketDetailsComponent, {
      header: 'Rent NFT',
      width: 'auto',
      data: {
        token: token,
      },
    });
  }

  get duration(): number {
    return this.formGroup.get('duration')?.value;
  }

  private connectWallet(): void {
    this.globalState.connect(
      'address',
      this.neoline.getAccount().pipe(
        map((v) => v.address),
        tap(() => this.ui.displaySuccess('Wallet connected'))
      )
    );
  }
}
