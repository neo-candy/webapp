import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { from, Subject } from 'rxjs';
import { finalize, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { CandefiToken } from '../../../services/candefi.service';

import { NeolineService } from '../../../services/neoline.service';
import {
  RentfuseService,
  TokenWithListingOptionalRenting,
} from '../../../services/rentfuse.service';
import { UiService } from '../../../services/ui.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../state/global.state';
import { RentDetailsComponent } from './rent-details/rent-details.component';

interface MarketDetailsState {
  tokens: TokenWithListingOptionalRenting[];
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
  readonly onToken$ = new Subject<CandefiToken>();
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
    this.connect(
      'tokens',
      from(this.config.data.tokens as CandefiToken[]).pipe(
        mergeMap((token: CandefiToken) =>
          this.rentfuse.getListingForToken(token)
        ),
        toArray(),
        finalize(() => this.set({ isLoading: false }))
      )
    );
  }

  displayRentModal(token: TokenWithListingOptionalRenting): void {
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
