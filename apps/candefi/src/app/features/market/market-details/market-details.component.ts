import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { from, Subject } from 'rxjs';
import { finalize, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { Token } from '../../../services/candefi.service';
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
}

const DEFAULT_STATE: MarketDetailsState = {
  tokens: [],
  isLoading: true,
};

@Component({
  templateUrl: './market-details.component.html',
  styleUrls: ['./market-details.component.scss'],
  providers: [DialogService],
})
export class MarketDetailsComponent extends RxState<MarketDetailsState> {
  readonly state$ = this.select();
  readonly onToken$ = new Subject<Token>();

  constructor(
    private config: DynamicDialogConfig,
    private rentfuse: RentfuseService,
    private neoline: NeolineService,
    private ui: UiService,
    private dialogService: DialogService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    from(this.config.data.tokens as Token[])
      .pipe(
        mergeMap((token: Token) => this.rentfuse.getListingForNft(token)),
        toArray(),
        finalize(() => this.set({ isLoading: false }))
      )
      .subscribe((res) => {
        this.set({ tokens: res });
      });
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
