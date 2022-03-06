import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NeonJSService } from './neonjs.service';
import { NeolineService } from './neoline.service';
import {
  NeoInvokeArgs,
  NeoInvokeArgument,
  NeoInvokeWriteResponse,
} from '../models/n3';
import { sc, wallet } from '@cityofzion/neon-js';
import { map, mergeAll, switchMap, tap, toArray } from 'rxjs/operators';
import { mapToNFT, NftProperties } from './nft.service';
import { NFT } from '../app.component';

@Injectable({
  providedIn: 'root',
})
export class StakingService {
  constructor(private neonjs: NeonJSService, private neoline: NeolineService) {}

  public taxAmount(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('taxAmount', [], scriptHash);
  }
  public totalVillagerCandiesStaked(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('totalVillagerCandiesStaked', [], scriptHash);
  }
  public totalVillainCandiesStaked(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('totalVillainCandiesStaked', [], scriptHash);
  }
  public totalCandiesEarned(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('totalCandiesEarned', [], scriptHash);
  }
  public dailyCandyRate(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('dailyCandyRate', [], scriptHash);
  }
  public isPaused(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('isPaused', [], scriptHash);
  }
  public minStakeBlockCount(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('minStakeBlockCount', [], scriptHash);
  }
  public maxCandiesToEarn(): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs.rpcRequest('maxCandiesToEarn', [], scriptHash);
  }
  public tokensOf(address: string): Observable<NFT[]> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.neonjs
      .rpcRequest('tokensOf', [sc.ContractParam.hash160(address)], scriptHash)
      .pipe(
        map((res) => res.map((v: any) => JSON.parse(atob(v.value)))),
        map((res: NftProperties[]) => res.map((props) => mapToNFT(props, true)))
      );
  }

  public claimableAmount(address: string): Observable<number> {
    const scriptHash = environment.testnet.candyclashStaking;
    return this.tokensOf(address).pipe(
      map((tokens) =>
        tokens.map((token) => sc.ContractParam.integer(token.tokenId))
      ),
      mergeAll(),
      toArray(),
      switchMap((params) =>
        this.neonjs.rpcRequest(
          'availableClaimAmount',
          [sc.ContractParam.array(...params)],
          scriptHash
        )
      )
    );
  }

  public stake(
    address: string,
    tokenIds: number[]
  ): Observable<NeoInvokeWriteResponse> {
    const args: NeoInvokeArgument[] = [];
    for (let i = 0; i < tokenIds.length; i++) {
      args.push({
        scriptHash: environment.testnet.candyclashNFT,
        operation: 'transfer',
        args: [
          NeolineService.hash160(environment.testnet.candyclashStaking),
          NeolineService.int(tokenIds[i]),
          NeolineService.any(null),
        ],
      });
    }
    return this.neoline.invokeMultiple({
      signers: [{ account: new wallet.Account(address).scriptHash, scopes: 1 }],
      invokeArgs: args,
    });
  }
}
