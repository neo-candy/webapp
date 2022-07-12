import { Inject, Injectable } from '@angular/core';
import { sc, tx, wallet } from '@cityofzion/neon-js';
import { RxState } from '@rx-angular/state';
import { Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NeoInvokeWriteResponse } from '../models/n3';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';
import { CandefiToken } from './candefi.service';
import { NeolineService } from './neoline.service';
import { NeonJSService } from './neonjs.service';
import { UiService } from './ui.service';

export interface Listing {
  listingId: number;
  minMinutes: number;
  maxMinutes: number;
  gasPerMinute: number;
  collateral: number;
}

export interface Renting {
  duration: number;
  startedAt: number;
}

export interface RentfuseTokenDetails {
  listing: Listing;
  renting?: Renting;
}

export type TokenDetails = CandefiToken & RentfuseTokenDetails;

@Injectable({ providedIn: 'root' })
export class RentfuseService {
  constructor(
    private neonjs: NeonJSService,
    private neoline: NeolineService,
    private ui: UiService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {}

  public startRenting(
    address: string,
    listingId: number,
    duration: number,
    paymentAmount: number
  ): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.testnet.gas,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.rentfuseProtocol),
          NeolineService.int(paymentAmount),
          NeolineService.array([
            NeolineService.int(1),
            NeolineService.int(listingId),
            NeolineService.int(duration),
          ]),
        ],
      },
    ];
    return this.neoline
      .invokeMultiple({
        signers: [
          {
            account: new wallet.Account(address).scriptHash,
            scopes: tx.WitnessScope.CalledByEntry,
          },
        ],
        invokeArgs: [...args],
      })
      .pipe(
        switchMap((res) => this.ui.displayTxLoadingModal(res.txid)),
        tap(() => this.ui.displaySuccess('You started renting a new NFT')),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  getListingIdFromNft(tokenId: string): Observable<number> {
    const scriptHash = environment.testnet.rentfuseProtocol;
    return this.neonjs.rpcRequest(
      'getListingIdFromNft',
      [
        sc.ContractParam.hash160(environment.testnet.candefi),
        sc.ContractParam.byteArray(tokenId),
      ],
      scriptHash
    );
  }

  getListing(id: number): Observable<Listing> {
    const scriptHash = environment.testnet.rentfuseProtocol;
    return this.neonjs
      .rpcRequest('getListing', [sc.ContractParam.integer(id)], scriptHash)
      .pipe(map((res) => this.mapListing(res)));
  }

  getRenting(rentingId: string): Observable<Renting | null> {
    if (!rentingId) {
      return of(null);
    }
    const scriptHash = environment.testnet.rentfuseProtocol;
    return this.neonjs
      .rpcRequest(
        'getRenting',
        [sc.ContractParam.string(rentingId)],
        scriptHash
      )
      .pipe(map((v) => this.mapRenting(v)));
  }

  getLastRentingIdForListing(listingId: number): Observable<string> {
    const scriptHash = environment.testnet.rentfuseProtocol;
    return this.neonjs.rpcRequest(
      'getLastRentingIdForListing',
      [sc.ContractParam.integer(listingId)],
      scriptHash
    );
  }

  /* CUSTOM METHODS */

  getListingForToken(token: CandefiToken): Observable<TokenDetails> {
    return this.getListingIdFromNft(token.tokenId).pipe(
      filter((id) => id != 0),
      switchMap((listingId) => this.getListing(listingId)),
      map((listing) => this.addListingToToken(token, listing))
    );
  }

  getRentingForToken(token: TokenDetails): Observable<TokenDetails> {
    return this.getLastRentingIdForListing(token.listing.listingId).pipe(
      switchMap((rentingId) => this.getRenting(rentingId)),
      map((renting) => this.addRentingToToken(token, renting))
    );
  }

  getListingAndRentingForToken(token: CandefiToken): Observable<TokenDetails> {
    return this.getListingForToken(token).pipe(
      switchMap((listing) => this.getRentingForToken(listing))
    );
  }

  private addRentingToToken(
    token: TokenDetails,
    renting: Renting | null
  ): TokenDetails {
    if (!renting) {
      return token;
    }
    return {
      renting: {
        duration: renting.duration,
        startedAt: renting.startedAt,
      },
      ...token,
    };
  }

  private addListingToToken(
    token: CandefiToken,
    listing: Listing
  ): TokenDetails {
    return {
      listing: {
        collateral: listing.collateral / Math.pow(10, 8),
        gasPerMinute: listing.gasPerMinute / Math.pow(10, 8),
        listingId: listing.listingId,
        maxMinutes: listing.maxMinutes,
        minMinutes: listing.minMinutes,
      },
      ...token,
    };
  }

  private mapRenting(v: any[]): Renting {
    return {
      duration: v[3].value,
      startedAt: v[4].value,
    };
  }

  private mapListing(v: any[]): Listing {
    return {
      listingId: v[0].value,
      minMinutes: v[4].value,
      maxMinutes: v[5].value,
      gasPerMinute: v[3].value[1].value,
      collateral: v[6].value,
    };
  }
}
