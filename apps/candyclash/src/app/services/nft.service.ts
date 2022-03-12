import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NeonJSService } from './neonjs.service';
import { sc, wallet } from '@cityofzion/neon-js';
import { NeolineService } from './neoline.service';
import { NFT } from '../app.component';
import { NeoInvokeWriteResponse } from '../models/n3';

export interface NftProperties {
  tokenId: number;
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

@Injectable({
  providedIn: 'root',
})
export class NftService {
  constructor(private neonjs: NeonJSService, private neoline: NeolineService) {}

  public totalSupply(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('totalSupply', [], scriptHash);
  }

  public maxGenesisAmount(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('maxGenesisAmount', [], scriptHash);
  }

  public isPaused(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('isPaused', [], scriptHash);
  }

  public gasPrice(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('gasPrice', [], scriptHash);
  }

  public candyPrice(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('candyPrice', [], scriptHash);
  }

  public maxTokensAmount(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('maxTokensAmount', [], scriptHash);
  }

  public propertiesJson(tokenId: number): Observable<NftProperties> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs
      .rpcRequest(
        'propertiesJson',
        [sc.ContractParam.integer(tokenId)],
        scriptHash
      )
      .pipe(map((res) => JSON.parse(atob(res))));
  }

  public tokensOfJson(address: string): Observable<NFT[]> {
    const scriptHash = environment.testnet.candyclashNFT;
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
            .map((v: NftProperties) => mapToNFT(v, false))
        )
      );
  }

  public mint(
    address: string,
    amount: number,
    price: number
  ): Observable<NeoInvokeWriteResponse> {
    const args = [];
    for (let i = 0; i < amount; i++) {
      args.push({
        scriptHash: environment.testnet.tokens.gas,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.candyclashNFT),
          NeolineService.int(price),
          NeolineService.any(null),
        ],
      });
    }

    return this.neoline.invokeMultiple({
      signers: [{ account: new wallet.Account(address).scriptHash, scopes: 1 }],
      invokeArgs: [...args],
    });
  }
}
export const mapToNFT = (props: NftProperties, staked: boolean): NFT => {
  return {
    tokenId: props.tokenId,
    name: props.name,
    bonus:
      props.attributes.filter((a) => a.trait_type === 'Claim Bonus')[0]
        ?.value || '0%',
    image: props.image,
    staked,
    sugar: props.attributes.filter((a) => a.trait_type === 'Sugar')[0]?.value,
    type: props.attributes.filter((a) => a.trait_type === 'Type')[0].value,
    generation: props.attributes.filter((a) => a.trait_type === 'Generation')[0] //TODO: remove ? .. used for compatible reasons with old contract version
      ?.value,
  };
};
