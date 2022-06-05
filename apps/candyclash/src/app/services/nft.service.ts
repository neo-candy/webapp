import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NeonJSService } from './neonjs.service';
import { sc, wallet } from '@cityofzion/neon-js';
import { NeolineService } from './neoline.service';
import { NFT } from '../app.component';
import { NeoInvokeWriteResponse } from '../models/n3';
import { ErrorService } from './error.service';

export interface NftProperties {
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

@Injectable({
  providedIn: 'root',
})
export class NftService {
  constructor(
    private neonjs: NeonJSService,
    private neoline: NeolineService,
    private error: ErrorService
  ) {}

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

  public mintedVillains(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('mintedVillainsCount', [], scriptHash);
  }

  public mintedVillagers(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('mintedVillagersCount', [], scriptHash);
  }

  public nftPricesCandy(): Observable<number[]> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs
      .rpcRequest('nftPricesCandy', [], scriptHash)
      .pipe(
        map((v: { type: string; value: number }[]) => v.map((v) => v.value))
      );
  }

  public maxTokensAmount(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('maxTokensAmount', [], scriptHash);
  }

  public experienceTable(): Observable<number[]> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs
      .rpcRequest('experienceTable', [], scriptHash)
      .pipe(
        map((v: { type: string; value: number }[]) => v.map((v) => v.value))
      );
  }

  public pricePerExperiencePoint(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('pricePerExperiencePoint', [], scriptHash);
  }

  public pricePerActionPoint(): Observable<number> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs.rpcRequest('pricePerActionPoint', [], scriptHash);
  }

  public actionPointsLevelTable(): Observable<number[]> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs
      .rpcRequest('actionPointsLevelTable', [], scriptHash)
      .pipe(
        map((v: { type: string; value: number }[]) => v.map((v) => v.value))
      );
  }

  public propertiesJson(tokenId: string): Observable<NftProperties> {
    const scriptHash = environment.testnet.candyclashNFT;
    return this.neonjs
      .rpcRequest(
        'propertiesJson',
        [sc.ContractParam.string(tokenId)],
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
        scriptHash: environment.testnet.neocandy,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.candyclashNFT),
          NeolineService.int(price),
          NeolineService.any(null),
        ],
      });
    }

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

  public addActionPoints(
    address: string,
    amount: number,
    tokenId: string
  ): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.testnet.neocandy,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.candyclashNFT),
          NeolineService.int(amount),
          NeolineService.array([
            NeolineService.string(tokenId),
            NeolineService.string('addActionPoints'),
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

  public addSugar(
    address: string,
    amount: number,
    tokenId: string
  ): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.testnet.neocandy,
        operation: 'transfer',
        args: [
          NeolineService.address(address),
          NeolineService.hash160(environment.testnet.candyclashNFT),
          NeolineService.int(amount),
          NeolineService.array([
            NeolineService.string(tokenId),
            NeolineService.string('addExperienceToToken'),
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
    sugar: Number(
      props.attributes.filter((a) => a.trait_type === 'Sugar')[0]?.value
    ),
    type: props.attributes.filter((a) => a.trait_type === 'Type')[0].value,
    generation: Number(
      props.attributes.filter((a) => a.trait_type === 'Generation')[0]?.value
    ),
    level: Number(
      props.attributes.filter((a) => a.trait_type === 'Level')[0]?.value
    ),
    origin: props.attributes.filter((a) => a.trait_type === 'Origin')[0]?.value,
    age: Number(
      props.attributes.filter((a) => a.trait_type === 'Age')[0]?.value
    ),
    actions: Number(
      props.attributes.filter((a) => a.trait_type === 'Action Points')[0]?.value
    ),
  };
};
