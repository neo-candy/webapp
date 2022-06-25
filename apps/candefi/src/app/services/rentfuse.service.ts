import { Inject, Injectable } from '@angular/core';
import { sc, wallet } from '@cityofzion/neon-js';
import { RxState } from '@rx-angular/state';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NeoInvokeWriteResponse } from '../models/n3';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';
import { Token } from './candefi.service';
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

export interface TokenDetails extends Token {
  listingId: number;
  minRentInMinutes: number;
  maxRentInMinutes: number;
  gasPerMinute: number;
  collateral: number;
}

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
          { account: new wallet.Account(address).scriptHash, scopes: 1 },
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

  getListingForNft(token: Token): Observable<TokenDetails> {
    return this.getListingIdFromNft(token.tokenId).pipe(
      switchMap((listingId) => this.getListing(listingId)),
      map((listing) => this.addTokenDetails(token, listing))
    );
  }

  addTokenDetails(token: Token, listing: Listing): TokenDetails {
    const realValue =
      token.realValue +
      (this.globalState.get('neoPrice') * Math.pow(10, 8) - token.strike) *
        token.vi;
    return {
      ...token,
      listingId: listing.listingId,
      maxRentInMinutes: listing.maxMinutes,
      minRentInMinutes: listing.minMinutes,
      gasPerMinute: listing.gasPerMinute / Math.pow(10, 8),
      realValue: realValue > token.stake ? token.stake : realValue,
      collateral: listing.collateral / Math.pow(10, 8),
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
