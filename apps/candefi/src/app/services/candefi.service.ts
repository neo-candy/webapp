import { Inject, Injectable } from '@angular/core';
import { sc, tx, wallet } from '@cityofzion/neon-js';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NeoInvokeWriteResponse, NeoTypedValue } from '../models/n3';
import { UiService } from './ui.service';
import { NeolineService } from './neoline.service';
import { NeonJSService } from './neonjs.service';
import { processBase64Hash160 } from '../shared/utils';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';
import { RxState } from '@rx-angular/state';
import { TokenWithListingOptionalRenting } from './rentfuse.service';

const CALL = 1;
const PUT = 2;

export type NFTType = 'Call' | 'Put';

interface TokenProperties {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  tokenURI: string;
  properties: {
    has_locked: number;
    type: number;
  };
  attributes: {
    trait_type: string;
    value: string;
    display_type: string;
  }[];
}

export interface CandefiToken {
  tokenId: string;
  stake: number;
  strike: number;
  writer: string;
  owner: string;
  type: NFTType;
  created: number;
  timeDecay: number;
  leverage: number;
  value: number;
  isExercised: boolean;
  safe: boolean;
}

export interface Earnings {
  address: string;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class CandefiService {
  constructor(
    private neoline: NeolineService,
    private neonjs: NeonJSService,
    private ui: UiService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {}
  public mint(
    address: string,
    type: NFTType,
    strike: number,
    stake: number,
    timeDecay: number,
    value: number,
    leverage: number,
    safe: boolean,
    minDuration: number,
    maxDuration: number,
    collateral: number,
    feePerMinute: number
  ): Observable<NeoInvokeWriteResponse> {
    return this.candyProtocolFee().pipe(
      map((fee) => ({
        scriptHash: environment.testnet.neocandy,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.candefi),
          NeolineService.int(stake + fee),
          NeolineService.array([
            NeolineService.int(type === 'Call' ? CALL : PUT),
            NeolineService.int(strike),
            NeolineService.int(timeDecay),
            NeolineService.int(value),
            NeolineService.int(leverage),
            NeolineService.bool(safe),
            NeolineService.int(feePerMinute),
            NeolineService.int(minDuration),
            NeolineService.int(maxDuration),
            NeolineService.int(collateral),
          ]),
        ],
      })),
      mergeMap((arg) =>
        this.neoline
          .invokeMultiple({
            signers: [
              {
                account: new wallet.Account(address).scriptHash,
                scopes: tx.WitnessScope.CustomContracts,
                allowedContracts: [
                  environment.testnet.candefi,
                  environment.testnet.neocandy,
                ],
              },
            ],

            invokeArgs: [arg],
          })
          .pipe(
            switchMap((res) => this.ui.displayTxLoadingModal(res.txid)),
            tap(() =>
              this.ui.displaySuccess('You listed a new ' + type + ' NFT')
            ),
            catchError((e) => {
              this.ui.displayError(e);
              return throwError(e);
            })
          )
      )
    );
  }

  public exercise(
    address: string,
    tokenIds: string[]
  ): Observable<NeoInvokeWriteResponse> {
    const args: {
      scriptHash: string;
      operation: string;
      args: NeoTypedValue[];
    }[] = [];
    tokenIds.forEach((tokenId) => {
      args.push({
        scriptHash: environment.testnet.candefi,
        operation: 'exercise',
        args: [NeolineService.byteArray(tokenId)],
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
        invokeArgs: [...args],
      })
      .pipe(
        switchMap((res) => this.ui.displayTxLoadingModal(res.txid)),
        tap(() =>
          this.ui.displaySuccess(`You exercised ${tokenIds.length} position(s)`)
        ),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  public closeListing(
    address: string,
    tokenId: string
  ): Observable<NeoInvokeWriteResponse> {
    const args: {
      scriptHash: string;
      operation: string;
      args: NeoTypedValue[];
    }[] = [
      {
        scriptHash: environment.testnet.candefi,
        operation: 'closeListing',
        args: [NeolineService.byteArray(tokenId)],
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
        tap(() => this.ui.displaySuccess('You closed 1 listing')),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  public tokensOfJson(address: string): Observable<CandefiToken[]> {
    const scriptHash = environment.testnet.candefi;
    return this.neonjs
      .rpcRequest(
        'tokensOfJson',
        [sc.ContractParam.hash160(address)],
        scriptHash
      )
      .pipe(
        map((res) =>
          res
            .map((v: any) => JSON.parse(atob(v.value)))
            .map((v: TokenProperties) => this.mapToken(v))
        )
      );
  }

  public earnings(): Observable<Earnings[]> {
    const scriptHash = environment.testnet.candefi;
    return this.neonjs
      .rpcRequest('earnings', [], scriptHash)
      .pipe(map((res) => JSON.parse(atob(res))));
  }

  public candyProtocolFee(): Observable<number> {
    const scriptHash = environment.testnet.candefi;
    return this.neonjs
      .rpcRequest('candyProtocolFee', [], scriptHash)
      .pipe(map((res) => JSON.parse(res)));
  }

  public minStake(): Observable<number> {
    const scriptHash = environment.testnet.candefi;
    return this.neonjs
      .rpcRequest('minStake', [], scriptHash)
      .pipe(map((res) => JSON.parse(res)));
  }

  public tokensOfWriterJson(address: string): Observable<CandefiToken[]> {
    const scriptHash = environment.testnet.candefi;
    return this.neonjs
      .rpcRequest(
        'tokensOfWriterJson',
        [sc.ContractParam.hash160(address)],
        scriptHash
      )
      .pipe(
        map((res) =>
          res
            .map((v: any) => JSON.parse(atob(v.value)))
            .map((v: TokenProperties) => this.mapToken(v))
        )
      );
  }

  public propertiesJson(tokenId: string): Observable<CandefiToken> {
    const scriptHash = environment.testnet.candefi;
    return this.neonjs
      .rpcRequest(
        'propertiesJson',
        [sc.ContractParam.byteArray(tokenId)],
        scriptHash
      )
      .pipe(
        map((res) => JSON.parse(atob(res))),
        map((parsed: TokenProperties) => this.mapToken(parsed))
      );
  }

  public calculateProfit(
    token: TokenWithListingOptionalRenting,
    borrower: boolean,
    expired?: boolean
  ): number {
    if (!token.renting) {
      throw new Error('calculateBorrowerProfit_noRenting');
    }
    const gasValue =
      token.listing.gasPerMinute *
      token.renting.duration *
      this.globalState.get('gasPrice').curr;
    if (expired) {
      return borrower ? -gasValue : gasValue;
    }
    const candyValue = token.stake * this.globalState.get('candyPrice').curr;
    if (borrower) {
      return candyValue - gasValue;
    }
    return gasValue - candyValue;
  }

  private mapToken(v: TokenProperties): CandefiToken {
    const strike = Number(
      v.attributes.filter((a) => a.trait_type === 'Strike')[0].value
    );
    const neoPrice = this.globalState.get('neoPrice').curr * Math.pow(10, 8);
    const delta = neoPrice - strike;
    const leverage = Number(
      v.attributes.filter((a) => a.trait_type === 'Leverage')[0].value
    );
    const stake = Number(
      v.attributes.filter((a) => a.trait_type === 'Stake')[0].value
    );
    const result = delta * leverage;
    const value = Number(
      v.attributes.filter((a) => a.trait_type === 'Value')[0].value
    );
    const updatedValue =
      value + result > stake ? stake : value + result < 0 ? 0 : value + result;

    return {
      tokenId: btoa(v.tokenId),
      type:
        Number(v.attributes.filter((a) => a.trait_type === 'Type')[0].value) ===
        CALL
          ? 'Call'
          : 'Put',
      stake: stake / Math.pow(10, 9),
      strike:
        Number(v.attributes.filter((a) => a.trait_type === 'Strike')[0].value) /
        Math.pow(10, 8),
      writer: new wallet.Account(
        processBase64Hash160(
          v.attributes.filter((a) => a.trait_type === 'Writer')[0].value
        )
      ).address,
      owner: new wallet.Account(
        processBase64Hash160(
          v.attributes.filter((a) => a.trait_type === 'Owner')[0].value
        )
      ).address,
      timeDecay:
        (Number(
          v.attributes.filter((a) => a.trait_type === 'Time Decay')[0].value
        ) *
          1000 *
          60 *
          60 *
          24) /
        Math.pow(10, 9),
      leverage: Number(
        v.attributes.filter((a) => a.trait_type === 'Leverage')[0].value
      ),
      value: updatedValue / Math.pow(10, 9),
      created: Number(
        v.attributes.filter((a) => a.trait_type === 'Created')[0].value
      ),
      isExercised: Boolean(
        v.attributes.filter((a) => a.trait_type === 'Exercised')[0].value
      ),
      safe: Boolean(
        v.attributes.filter((a) => a.trait_type === 'Safe')[0].value
      ),
    };
  }
}
