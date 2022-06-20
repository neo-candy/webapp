import { Component } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { from, Subject } from 'rxjs';
import { finalize, mergeMap, toArray } from 'rxjs/operators';
import { Token } from '../../../services/candefi.service';
import {
  RentfuseService,
  TokenDetails,
} from '../../../services/rentfuse.service';

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
})
export class MarketDetailsComponent extends RxState<MarketDetailsState> {
  readonly state$ = this.select();
  readonly onToken$ = new Subject<Token>();

  constructor(
    private config: DynamicDialogConfig,
    private rentfuse: RentfuseService
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

  onRowSelect(event: any): void {
    /* this.rentfuse
      .getListingIdFromNft(event.data.tokenId)
      .subscribe((id) =>
        window.open('https://www.testnet.rentfuse.com/listings/' + id, '_blank')
      ); */
  }
}
