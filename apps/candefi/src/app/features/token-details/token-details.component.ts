import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../environments/environment';
import { MenuItem } from 'primeng/api';
import { map, switchMap, tap } from 'rxjs/operators';
import { CandefiService } from '../../services/candefi.service';
import {
  TokenWithListingOptionalRenting,
  RentfuseService,
} from '../../services/rentfuse.service';
import { ThemeService } from '../../services/theme.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

enum TokenStatus {
  Unlisted = 0,
  Listed = 1,
  Rented = 2,
  Exercised = 3,
}
interface TokenDetailsState {
  token: TokenWithListingOptionalRenting;
  base64TokenId: string;
  isLoading: boolean;
  optionItems: MenuItem[];
  status: TokenStatus;
}

@Component({
  selector: 'cd-token-details',
  templateUrl: './token-details.component.html',
  styleUrls: ['./token-details.component.scss'],
})
export class TokenDetailsComponent extends RxState<TokenDetailsState> {
  tokenStatus = TokenStatus;
  readonly state$ = this.select();
  readonly fetchTokenId$ = this.route.params.pipe(map((res) => res['tokenId']));
  readonly fetchTokenStatus$ = this.select('token').pipe(
    map((token) => this.mapTokenStatus(token))
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private candefi: CandefiService,
    private rentfuse: RentfuseService,
    public theme: ThemeService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set({ isLoading: true });
    this.set({
      optionItems: [
        {
          label: 'Options',
          icon: 'pi pi-cog',
          items: [
            {
              label: 'Close listing',
              icon: 'pi pi-trash',
              command: () => this.closeListing(),
            },
          ],
        },
        { label: 'Profit Calculator', icon: 'pi pi-sliders-v' },
      ],
    });
    this.connect('base64TokenId', this.fetchTokenId$);
    this.connect(
      'token',
      this.fetchTokenId$.pipe(
        switchMap((id) => this.candefi.propertiesJson(btoa(id))),
        switchMap((token) => this.rentfuse.getListingAndRentingForToken(token)),
        tap(() => this.set({ isLoading: false }))
      )
    );
    this.connect('status', this.fetchTokenStatus$);
  }

  private closeListing(): void {
    this.rentfuse
      .closeListing(
        this.globalState.get('address'),
        this.get('token').listing.listingId
      )
      .subscribe((res) => {
        console.log(res), this.router.navigate(['/']);
      });
  }

  mapTokenStatus(token: TokenWithListingOptionalRenting): TokenStatus {
    if (token.isExercised) {
      return TokenStatus.Exercised;
    } else if (token.owner === environment.testnet.rentfuseAddress) {
      return TokenStatus.Listed;
    } else if (token.owner !== token.writer) {
      TokenStatus.Rented;
    }
    return TokenStatus.Unlisted;
  }
}
