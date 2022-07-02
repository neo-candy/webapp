import { Injectable } from '@angular/core';
import { wallet } from '@cityofzion/neon-js';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NeoInvokeWriteResponse } from '../models/n3';
import { NeolineService } from './neoline.service';
import { NeonJSService } from './neonjs.service';
import { UiService } from './ui.service';

@Injectable({ providedIn: 'root' })
export class NftService {
  constructor(
    private neoline: NeolineService,
    private neonjs: NeonJSService,
    private ui: UiService
  ) {}
  public mint(
    address: string,
    paymentAmount: number
  ): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.mainnet.neocandy,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.mainnet.lollipopNFT),
          NeolineService.int(paymentAmount),
          NeolineService.any(null),
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
        tap(() => this.ui.displaySuccess('You minted a Lollipop NFT')),
        catchError((e) => {
          this.ui.displayError(e);
          return throwError(e);
        })
      );
  }

  public currentPrice(): Observable<number> {
    const scriptHash = environment.mainnet.lollipopNFT;
    return this.neonjs.rpcRequest('currentPrice', [], scriptHash);
  }

  public currentSupply(): Observable<number> {
    const scriptHash = environment.mainnet.lollipopNFT;
    return this.neonjs.rpcRequest('currentSupply', [], scriptHash);
  }

  public isPaused(): Observable<number> {
    const scriptHash = environment.mainnet.lollipopNFT;
    return this.neonjs.rpcRequest('isPaused', [], scriptHash);
  }
}
