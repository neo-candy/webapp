import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { MenuItem } from 'primeng/api';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { CandefiService } from '../../services/candefi.service';
import { TokenDetails, RentfuseService } from '../../services/rentfuse.service';

interface TokenDetailsState {
  token: TokenDetails;
  isLoading: boolean;
}

@Component({
  selector: 'cd-token-details',
  templateUrl: './token-details.component.html',
  styleUrls: ['./token-details.component.scss'],
})
export class TokenDetailsComponent extends RxState<TokenDetailsState> {
  readonly state$ = this.select();
  readonly fetchTokenId$ = this.route.params.pipe(
    map((res) => btoa(res['tokenId']))
  );

  constructor(
    private route: ActivatedRoute,
    private candefi: CandefiService,
    private rentfuse: RentfuseService
  ) {
    super();
    this.set({ isLoading: true });
    this.connect(
      'token',
      this.fetchTokenId$.pipe(
        switchMap((id) => this.candefi.propertiesJson(id)),
        switchMap((token) => this.rentfuse.getListingAndRentingForToken(token)),
        tap(() => this.set({ isLoading: false }))
      )
    );
  }
}
