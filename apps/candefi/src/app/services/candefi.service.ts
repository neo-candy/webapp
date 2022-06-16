import { Injectable } from '@angular/core';
import { sc, wallet } from '@cityofzion/neon-js';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NeoInvokeWriteResponse } from '../models/n3';
import { ErrorService } from './error.service';
import { NeolineService } from './neoline.service';
import { NeonJSService } from './neonjs.service';
import { processBase64Hash160 } from './utils';

const CALL = 1;
const PUT = 2;
const PROTOCOL_FEE = 1000000000000;

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

export interface Token {
  tokenId: string;
  stake: number;
  strike: number;
  writer: string;
  owner: string;
  type: 'Call' | 'Put';
}

@Injectable({ providedIn: 'root' })
export class CandefiService {
  constructor(
    private neoline: NeolineService,
    private neonjs: NeonJSService,
    private error: ErrorService
  ) {}

  public mintCall(
    address: string,
    strike: number,
    stake: number
  ): Observable<NeoInvokeWriteResponse> {
    stake += PROTOCOL_FEE;
    const args = [
      {
        scriptHash: environment.testnet.neocandy,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.candefi),
          NeolineService.int(stake),
          NeolineService.array([
            NeolineService.int(CALL),
            NeolineService.int(strike),
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
        catchError((e) => {
          this.error.displayError(e);
          return throwError(e);
        })
      );
  }

  public mintPut(
    address: string,
    strike: number,
    stake: number
  ): Observable<NeoInvokeWriteResponse> {
    stake += PROTOCOL_FEE;
    const args = [
      {
        scriptHash: environment.testnet.neocandy,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.candefi),
          NeolineService.int(stake),
          NeolineService.array([
            NeolineService.int(PUT),
            NeolineService.int(strike),
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
        catchError((e) => {
          this.error.displayError(e);
          return throwError(e);
        })
      );
  }

  public tokensOfJson(address: string): Observable<Token[]> {
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

  public tokensOfWriterJson(address: string): Observable<Token[]> {
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

  private mapToken(v: TokenProperties): Token {
    return {
      tokenId: btoa(v.tokenId),
      type:
        Number(v.attributes.filter((a) => a.trait_type === 'Type')[0].value) ===
        CALL
          ? 'Call'
          : 'Put',
      stake: Number(
        v.attributes.filter((a) => a.trait_type === 'Stake')[0].value
      ),
      strike: Number(
        v.attributes.filter((a) => a.trait_type === 'Strike')[0].value
      ),
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
    };
  }
}
