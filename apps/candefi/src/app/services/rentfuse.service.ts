import { Inject, Injectable } from '@angular/core';
import { sc } from '@cityofzion/neon-js';
import { RxState } from '@rx-angular/state';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';
import { Token } from './candefi.service';
import { NeonJSService } from './neonjs.service';

export interface Listing {
  listingId: number;
  minMinutes: number;
  maxMinutes: number;
  gasPerMinute: number;
}

export interface TokenDetails extends Token {
  listingId: number;
  minRentInMinutes: number;
  maxRentInMinutes: number;
  gasPerMinute: number;
}

@Injectable({ providedIn: 'root' })
export class RentfuseService {
  constructor(
    private neonjs: NeonJSService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {}

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

  private mapListing(v: any[]): Listing {
    return {
      listingId: v[0].value,
      minMinutes: v[4].value,
      maxMinutes: v[5].value,
      gasPerMinute: v[3].value[1].value,
    };
  }

  public addTokenDetails(token: Token, listing: Listing): TokenDetails {
    const realValue =
      token.realValue +
      (this.globalState.get('neoPrice') * Math.pow(10, 8) - token.strike) *
        token.vi;
    return {
      ...token,
      listingId: listing.listingId,
      maxRentInMinutes: listing.maxMinutes,
      minRentInMinutes: listing.minMinutes,
      gasPerMinute: listing.gasPerMinute / 100000000,
      realValue: realValue > token.stake ? token.stake : realValue,
    };
  }
}
