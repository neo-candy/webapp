import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../environments/environment';
import { MenuItem } from 'primeng/api';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { CandefiService } from '../../services/candefi.service';
import {
  TokenWithListingOptionalRenting,
  RentfuseService,
} from '../../services/rentfuse.service';
import { ThemeService } from '../../services/theme.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';
import { combineLatest } from 'rxjs';
import { isExpired } from '../../shared/utils';

enum TokenStatus {
  Unlisted = 0,
  Listed = 1,
  Rented = 2,
  Exercised = 3,
  Expired = 4,
  Cancelled = 5,
}
interface TokenDetailsState {
  token: TokenWithListingOptionalRenting;
  base64TokenId: string;
  isLoading: boolean;
  optionItems: MenuItem[];
  status: TokenStatus;
  effectiveDate: Date;
  profit: number;
}

@Component({
  selector: 'cd-token-details',
  templateUrl: './token-details.component.html',
  styleUrls: ['./token-details.component.scss'],
})
export class TokenDetailsComponent extends RxState<TokenDetailsState> {
  tokenStatus = TokenStatus;
  readonly addressExplorer = environment.testnet.addressExplorer;
  readonly rentfuseAddress = environment.testnet.rentfuseAddress;
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
        { label: 'Profit Calculator', icon: 'pi pi-sliders-v', disabled: true },
        { label: 'Options', icon: 'pi pi-cog', disabled: true },
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
    this.connect(
      'effectiveDate',
      this.select('token').pipe(
        map((token) => {
          if (token.renting) {
            return new Date(
              token.renting.startedAt + token.renting.duration * 60 * 1000
            );
          } else {
            return new Date();
          }
        })
      )
    );

    this.connect(
      'profit',
      this.select('token').pipe(
        filter((token) => !!token.renting),
        map((token) => this.calculateBorrowerProfit(token))
      )
    );

    this.connect(
      'optionItems',
      combineLatest([
        this.globalState.select('address'),
        this.select('token'),
      ]).pipe(map(([address, token]) => this.mapOptionItems(address, token)))
    );
  }

  private closeListing(): void {
    this.rentfuse
      .closeListing(this.globalState.get('address'), [
        this.get('token').listing.listingId,
      ])
      .subscribe((res) => {
        console.log(res), this.router.navigate(['/']);
      });
  }

  private revoke(): void {
    this.rentfuse
      .revokeRenting(
        this.globalState.get('address'),
        this.get('token').rentingId
      )
      .subscribe((res) => {
        console.log(res), this.router.navigate(['/']);
      });
  }

  private burn(): void {
    this.candefi
      .burn(this.globalState.get('address'), [this.get('token')])
      .subscribe((res) => {
        console.log(res);
        this.router.navigate(['/']);
      });
  }

  private finishRenting(): void {
    this.rentfuse
      .finishRenting(
        this.globalState.get('address'),
        this.get('token').tokenId,
        this.get('token').rentingId
      )
      .subscribe((res) => {
        console.log(res);
        this.router.navigate(['/']);
      });
  }

  private mapTokenStatus(token: TokenWithListingOptionalRenting): TokenStatus {
    if (token.renting && token.renting?.remainingSeconds <= 0) {
      return TokenStatus.Expired;
    }
    if (token.isExercised) {
      return TokenStatus.Exercised;
    } else if (token.owner === token.writer) {
      return TokenStatus.Unlisted;
    } else if (
      token.owner === environment.testnet.rentfuseAddress &&
      token.stake > 0
    ) {
      return TokenStatus.Listed;
    } else if (
      token.owner !== token.writer &&
      token.owner !== environment.testnet.rentfuseAddress
    ) {
      return TokenStatus.Rented;
    } else if (
      token.stake === 0 &&
      token.owner === environment.testnet.rentfuseAddress
    ) {
      return TokenStatus.Cancelled;
    }
    throw new Error('Unknown token status');
  }

  private mapOptionItems(
    address: string,
    token: TokenWithListingOptionalRenting
  ): MenuItem[] {
    const optionItems: MenuItem[] = [];
    const options: MenuItem = {
      label: 'Options',
      icon: 'pi pi-cog',
      items: [],
      disabled: true,
    };
    const profitCalculator: MenuItem = {
      label: 'Profit Calculator',
      icon: 'pi pi-sliders-v',
      disabled: false,
    };

    const status = this.mapTokenStatus(token);
    if (address === token.writer) {
      switch (status) {
        case TokenStatus.Unlisted: {
          options.disabled = false;
          options.items?.push({
            label: 'Claim',
            icon: 'pi pi-eject',
            command: () => this.burn(),
          });
          profitCalculator.disabled = true;
          break;
        }
        case TokenStatus.Listed:
        case TokenStatus.Cancelled: {
          options.disabled = false;
          options.items?.push({
            label: 'Close Listing',
            icon: 'pi pi-trash',
            command: () => this.closeListing(),
          });
          break;
        }
        case TokenStatus.Expired: {
          options.disabled = false;
          options.items?.push({
            label: 'Revoke Renting',
            icon: 'pi pi-replay',
            command: () => this.revoke(),
          });
          break;
        }
      }
    } else if (address === token.owner) {
      switch (status) {
        case TokenStatus.Rented: {
          options.disabled = false;
          options.items?.push(
            {
              label: 'Exercise',
              icon: 'pi pi-step-forward',
            },
            {
              label: 'Finish Renting',
              icon: 'pi pi-stop-circle',
              command: () => this.finishRenting(),
            }
          );
          break;
        }
        case TokenStatus.Expired: {
          options.disabled = false;
          options.items?.push({
            label: 'Finish Renting',
            icon: 'pi pi-stop-circle',
            command: () => this.finishRenting(),
          });
          break;
        }
      }
    }
    optionItems.push(profitCalculator, options);
    return optionItems;
  }

  calculateBorrowerProfit(token: TokenWithListingOptionalRenting): number {
    const profit = this.candefi.calculateProfit(token, true, isExpired(token));
    token.profit = profit;
    return profit;
  }
}
