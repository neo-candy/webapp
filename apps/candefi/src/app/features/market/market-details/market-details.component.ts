import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { from, Subject } from 'rxjs';
import { filter, finalize, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { CandefiToken } from '../../../services/candefi.service';

import { NeolineService } from '../../../services/neoline.service';
import {
  RentfuseService,
  TokenWithListingOptionalRenting,
} from '../../../services/rentfuse.service';
import { UiService } from '../../../services/ui.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../state/global.state';
import { RentDetailsComponent } from '../../../shared/components/rent-details/rent-details.component';

interface MarketDetailsState {
  tokens: TokenWithListingOptionalRenting[];
  isLoading: boolean;
  address: string;
}

const DEFAULT_STATE: Partial<MarketDetailsState> = {
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
    private ref: DynamicDialogRef,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect('address', this.globalState.select('address'));
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
      const ref = this.dialogService.open(RentDetailsComponent, {
        header: 'Rent NFT',
        width: '70%',
        data: {
          token: token,
        },
      });
      this.hold(ref.onClose.pipe(filter((v) => !!v)), () => this.ref.close());
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
