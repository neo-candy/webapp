import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { map, switchMap, tap } from 'rxjs/operators';
import { CandefiService } from '../../services/candefi.service';
import { TokenDetails, RentfuseService } from '../../services/rentfuse.service';
import { ThemeService } from '../../services/theme.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

interface TokenDetailsState {
  token: TokenDetails;
  base64TokenId: string;
  isLoading: boolean;
}

@Component({
  selector: 'cd-token-details',
  templateUrl: './token-details.component.html',
  styleUrls: ['./token-details.component.scss'],
})
export class TokenDetailsComponent extends RxState<TokenDetailsState> {
  readonly state$ = this.select();
  readonly fetchTokenId$ = this.route.params.pipe(map((res) => res['tokenId']));

  items = [
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
  ];
  constructor(
    private route: ActivatedRoute,
    private candefi: CandefiService,
    private rentfuse: RentfuseService,
    public theme: ThemeService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set({ isLoading: true });
    this.connect('base64TokenId', this.fetchTokenId$);
    this.connect(
      'token',
      this.fetchTokenId$.pipe(
        switchMap((id) => this.candefi.propertiesJson(btoa(id))),
        switchMap((token) => this.rentfuse.getListingAndRentingForToken(token)),
        tap(() => this.set({ isLoading: false }))
      )
    );
  }

  private closeListing(): void {
    this.candefi
      .closeListing(this.globalState.get('address'), this.get('token').tokenId)
      .subscribe();
  }
}
