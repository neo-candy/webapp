import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { sc, tx, wallet } from '@cityofzion/neon-js';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  NeoInvokeArgument,
  NeoInvokeWriteResponse,
  NeoTypedValue,
} from '../models/n3';
import { processBase64Hash160 } from '../shared/utils';
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
  remainingSeconds: number;
  borrower: string;
}

export type TokenWithListingOptionalRenting = CandefiToken & {
  listing: Listing;
  renting?: Renting;
};

@Injectable({ providedIn: 'root' })
export class RentfuseService {
  constructor(
    private neonjs: NeonJSService,
    private neoline: NeolineService,
    private ui: UiService,
    private decimalPipe: DecimalPipe
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
        tap((res) =>
          this.ui.displaySuccess('You started renting a new NFT', res.txid)
        ),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  public closeListing(
    address: string,
    listingIds: number[]
  ): Observable<NeoInvokeWriteResponse> {
    const args: NeoInvokeArgument[] = [];
    listingIds.forEach((listingId) => {
      args.push({
        scriptHash: environment.testnet.rentfuseProtocol,
        operation: 'closeListing',
        args: [NeolineService.int(listingId)],
      });
    });
    return this.neoline
      .invokeMultiple({
        signers: [
          {
            account: new wallet.Account(address).scriptHash,
            scopes: tx.WitnessScope.CalledByEntry,
          },
        ],
        invokeArgs: args,
      })
      .pipe(
        switchMap((res) => this.ui.displayTxLoadingModal(res.txid)),
        tap((res) =>
          this.ui.displaySuccess(
            `You closed ${listingIds.length} listing`,
            res.txid
          )
        ),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  public revokeRenting(
    address: string,
    rentingId: string
  ): Observable<NeoInvokeWriteResponse> {
    const args: {
      scriptHash: string;
      operation: string;
      args: NeoTypedValue[];
    }[] = [
      {
        scriptHash: environment.testnet.rentfuseProtocol,
        operation: 'revokeRenting',
        args: [NeolineService.byteArray(rentingId)],
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
        tap((res) => this.ui.displaySuccess('You revoked 1 renting', res.txid)),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  public finishRenting(
    address: string,
    tokenId: string,
    rentingId: string
  ): Observable<NeoInvokeWriteResponse> {
    const args: {
      scriptHash: string;
      operation: string;
      args: NeoTypedValue[];
    }[] = [
      {
        scriptHash: environment.testnet.candefi,
        operation: 'transfer',
        args: [
          NeolineService.address(environment.testnet.rentfuseAddress),
          NeolineService.byteArray(tokenId),
          NeolineService.array([
            NeolineService.int(2),
            NeolineService.string(rentingId),
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
        tap((res) =>
          this.ui.displaySuccess('You finished 1 renting', res.txid)
        ),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }
  public claimAmount(
    address: string,
    amount: number,
    paymentToken: string,
    symbol: string
  ): Observable<NeoInvokeWriteResponse> {
    const args: {
      scriptHash: string;
      operation: string;
      args: NeoTypedValue[];
    }[] = [
      {
        scriptHash: environment.testnet.rentfuseProtocol,
        operation: 'claimAmount',
        args: [
          NeolineService.address(address),
          NeolineService.address(address),
          NeolineService.int(amount * Math.pow(10, 8)),
          NeolineService.hash160(paymentToken),
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
        tap((res) => {
          this.ui.displaySuccess(
            `You claimed ${this.decimalPipe.transform(amount)} ${symbol}`,
            res.txid
          );
          //TODO: Reload page
        }),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  getListingIdFromNft(tokenId: string): Observable<number> {
    const scriptHash = environment.testnet.rentfuseProtocol;
    return this.neonjs
      .rpcRequest(
        'getListingIdFromNft',
        [
          sc.ContractParam.hash160(environment.testnet.candefi),
          sc.ContractParam.byteArray(tokenId),
        ],
        scriptHash
      )
      .pipe(map((v) => Number(v)));
  }

  getListing(id: number): Observable<Listing> {
    const scriptHash = environment.testnet.rentfuseProtocol;
    if (id === 0) {
      //return a dummy listing if no listing was found
      return of({
        collateral: -1,
        gasPerMinute: -1,
        listingId: 0,
        maxMinutes: -1,
        minMinutes: -1,
      });
    }
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
        [sc.ContractParam.byteArray(rentingId)],
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

  getClaimableAmount(
    address: string,
    paymentTokenHash: string
  ): Observable<number> {
    const scriptHash = environment.testnet.rentfuseProtocol;
    return this.neonjs
      .rpcRequest(
        'getClaimableAmount',
        [
          sc.ContractParam.hash160(address),
          sc.ContractParam.hash160(paymentTokenHash),
        ],
        scriptHash
      )
      .pipe(map((v) => Number(v) / Math.pow(10, 8)));
  }

  /* CUSTOM METHODS */

  getListingForToken(
    token: CandefiToken
  ): Observable<TokenWithListingOptionalRenting> {
    return this.getListingIdFromNft(token.tokenId).pipe(
      switchMap((listingId) => this.getListing(listingId)),
      map((listing) => this.addListingToToken(token, listing))
    );
  }

  getRentingForToken(
    token: TokenWithListingOptionalRenting
  ): Observable<TokenWithListingOptionalRenting> {
    if (!token.listing) {
      throw new Error('getRentingForToken_noListing');
    }
    return this.getLastRentingIdForListing(token.listing.listingId).pipe(
      switchMap((rentingId) => this.getRenting(rentingId)),
      map((renting) => this.addRentingToToken(token, renting))
    );
  }

  getListingAndRentingForToken(
    token: CandefiToken
  ): Observable<TokenWithListingOptionalRenting> {
    return this.getListingForToken(token).pipe(
      switchMap((listing) => this.getRentingForToken(listing))
    );
  }

  private addRentingToToken(
    token: TokenWithListingOptionalRenting,
    renting: Renting | null
  ): TokenWithListingOptionalRenting {
    if (!renting) {
      return token;
    }
    const now = new Date().getTime();
    const msLeft = renting.startedAt + renting.duration * 60 * 1000 - now;
    return {
      renting: {
        borrower: renting.borrower,
        duration: renting.duration,
        startedAt: renting.startedAt,
        remainingSeconds: msLeft > 0 ? msLeft / 1000 : 0,
      },
      ...token,
    };
  }

  private addListingToToken(
    token: CandefiToken,
    listing: Listing
  ): TokenWithListingOptionalRenting {
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
      borrower: new wallet.Account(processBase64Hash160(v[2].value)).address,
      duration: Number(v[3].value),
      startedAt: Number(v[4].value),
      remainingSeconds: 0,
    };
  }

  private mapListing(v: any[]): Listing {
    return {
      listingId: Number(v[0].value),
      minMinutes: Number(v[4].value),
      maxMinutes: Number(v[5].value),
      gasPerMinute: Number(v[3].value[1].value),
      collateral: Number(v[6].value),
    };
  }
}
