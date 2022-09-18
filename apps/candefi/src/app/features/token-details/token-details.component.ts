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
import { ProfitCalculatorParams } from '../../shared/components/profit-calculator/profit-calculator.component';
import { RentDetailsComponent } from '../../shared/components/rent-details/rent-details.component';
import { DialogService } from 'primeng/dynamicdialog';
import { NeolineService } from '../../services/neoline.service';
import { UiService } from '../../services/ui.service';
import { TokenWithCurrentNFTValue } from '../profile/listings/listings.component';
import { determineCurrentValue } from '../../shared/utils';

enum TokenStatus {
  Unlisted = 0,
  Listed = 1,
  Rented = 2,
  Expired = 3,
  Finished = 4,
}
interface TokenDetailsState {
  token: TokenWithCurrentNFTValue;
  base64TokenId: string;
  isLoading: boolean;
  optionItems: MenuItem[];
  status: TokenStatus;
  effectiveDate: Date;
}

@Component({
  selector: 'cd-token-details',
  templateUrl: './token-details.component.html',
  styleUrls: ['./token-details.component.scss'],
  providers: [DialogService],
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
    private neoline: NeolineService,
    private dialogService: DialogService,
    private ui: UiService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set({ isLoading: true });
    this.set({
      optionItems: [{ label: 'Options', icon: 'pi pi-cog', disabled: true }],
    });
    this.connect('base64TokenId', this.fetchTokenId$);
    this.connect(
      'token',
      this.fetchTokenId$.pipe(
        switchMap((id) => this.candefi.propertiesJson(btoa(id))),
        switchMap((token) => this.rentfuse.getListingAndRentingForToken(token)),
        map((token) => this.mapProfits(token)),
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
      'optionItems',
      this.select('token').pipe(map((token) => this.mapOptionItems('', token)))
    );

    this.connect(
      'optionItems',
      combineLatest([
        this.globalState.select('address'),
        this.select('token'),
      ]).pipe(map(([address, token]) => this.mapOptionItems(address, token)))
    );
  }

  private mapProfits(
    token: TokenWithListingOptionalRenting
  ): TokenWithCurrentNFTValue {
    const neoPrice = this.globalState.get('neoPrice').curr;
    const currentValue = determineCurrentValue(token, neoPrice);
    const earnedFees =
      token.listing.gasPerMinute *
      (token.renting ? token.renting?.duration : 0) *
      this.globalState.get('gasPrice').curr;
    return {
      ...token,
      delta: earnedFees - currentValue,
      currentValue: currentValue,
      paidFees: earnedFees,
    };
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

  private exercise(): void {
    this.candefi
      .exercise(this.globalState.get('address'), [this.get('token').tokenId])
      .subscribe(() => {
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
    if (
      token.renting &&
      token.renting?.remainingSeconds <= 0 &&
      token.owner !== environment.testnet.rentfuseAddress
    ) {
      return TokenStatus.Expired;
    } else if (token.owner === token.writer) {
      return TokenStatus.Unlisted;
    } else if (
      token.owner === environment.testnet.rentfuseAddress &&
      !token.rentingId
    ) {
      return TokenStatus.Listed;
    } else if (
      token.owner !== token.writer &&
      token.owner !== environment.testnet.rentfuseAddress
    ) {
      return TokenStatus.Rented;
    } else if (
      (token.rentingId &&
        token.owner === environment.testnet.rentfuseAddress) ||
      token.isExercised
    ) {
      return TokenStatus.Finished;
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
      command: () => this.goToProfitCalculator(),
    };

    const status = this.mapTokenStatus(token);
    if (status === TokenStatus.Listed) {
      optionItems.push(profitCalculator);
    }
    if (address === token.writer) {
      switch (status) {
        case TokenStatus.Unlisted: {
          options.disabled = false;
          options.items?.push({
            label: 'Claim & Burn',
            icon: 'pi pi-eject',
            command: () => this.burn(),
          });
          break;
        }
        case TokenStatus.Listed: {
          options.disabled = false;
          options.items?.push({
            label: 'Close Listing',
            icon: 'pi pi-trash',
            command: () => this.closeListing(),
          });
          break;
        }
        case TokenStatus.Finished: {
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
              command: () => this.exercise(),
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
    } else {
      switch (status) {
        case TokenStatus.Listed: {
          options.disabled = false;
          options.items?.push({
            label: 'Rent',
            icon: 'pi pi-caret-right',
            command: () => this.displayRentModal(this.get('token')),
          });
          break;
        }
      }
    }
    optionItems.push(options);
    return optionItems;
  }

  private displayRentModal(token: TokenWithListingOptionalRenting): void {
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
      this.hold(ref.onClose.pipe(filter((v) => !!v)), () => ref.close());
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

  private goToProfitCalculator(): void {
    const token = this.get('token');
    const queryParams: ProfitCalculatorParams = {
      dailyFee: token.listing.gasPerMinute * 60 * 24,
      fromDays: token.listing.minMinutes / 60 / 24,
      toDays: token.listing.maxMinutes / 60 / 24,
      fromStrike: token.strike - 5 < 1 ? 1 : token.strike - 5,
      toStrike: token.strike + 5,
      initialValue: token.leverage > 0 ? token.value : token.stake,
      isSafe: token.safe,
      leverage: token.leverage,
      lender: false,
      stake: token.stake,
      strike: token.strike,
      final: true,
      timeDecay: token.timeDecay,
      type: token.type === 'Call' ? 'call' : 'put',
    };

    this.router.navigate(['calculator'], {
      queryParams: queryParams,
    });
  }
}
