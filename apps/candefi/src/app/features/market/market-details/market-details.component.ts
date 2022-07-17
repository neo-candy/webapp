import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { from, Subject } from 'rxjs';
import { finalize, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { CandefiToken } from '../../../services/candefi.service';
import {
  ContextService,
  HIDE_RENTED_CTX_KEY,
} from '../../../services/context.service';
import { NeolineService } from '../../../services/neoline.service';
import {
  RentfuseService,
  TokenDetails,
} from '../../../services/rentfuse.service';
import { UiService } from '../../../services/ui.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../state/global.state';
import { RentDetailsComponent } from './rent-details/rent-details.component';

interface MarketDetailsState {
  tokens: TokenDetails[];
  isLoading: boolean;
  hideRented: boolean;
}

const DEFAULT_STATE: MarketDetailsState = {
  tokens: [],
  isLoading: true,
  hideRented: true,
};

type HideRentedEvent = { checked: boolean };

@Component({
  templateUrl: './market-details.component.html',
  styleUrls: ['./market-details.component.scss'],
  providers: [DialogService],
})
export class MarketDetailsComponent extends RxState<MarketDetailsState> {
  readonly state$ = this.select();
  readonly onToken$ = new Subject<CandefiToken>();
  readonly onHideRentedSelected$ = new Subject<HideRentedEvent>();
  constructor(
    private config: DynamicDialogConfig,
    private rentfuse: RentfuseService,
    private neoline: NeolineService,
    private ui: UiService,
    private dialogService: DialogService,
    private context: ContextService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.set({
      hideRented:
        this.context.get(HIDE_RENTED_CTX_KEY) === 'true' ? true : false,
    });
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

    this.onHideRentedSelected$.subscribe((res) => console.log(res));
  }

  displayRentModal(token: TokenDetails): void {
    if (!this.globalState.get('address')) {
      this.connectWallet();
    } else {
      this.dialogService.open(RentDetailsComponent, {
        header: 'Rent NFT',
        width: 'auto',
        data: {
          token: token,
        },
      });
    }
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
