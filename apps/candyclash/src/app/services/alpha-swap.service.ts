import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { wallet } from '@cityofzion/neon-js';
import { NeolineService } from './neoline.service';
import { NeoInvokeWriteResponse } from '../models/n3';

@Injectable({
  providedIn: 'root',
})
export class AlphaSwapService {
  constructor(private neoline: NeolineService) {}

  public swap(address: string): Observable<NeoInvokeWriteResponse> {
    const args = [
      {
        scriptHash: environment.testnet.candySwap,
        operation: 'swap',
        args: [NeolineService.address(address)],
      },
    ];
    return this.neoline.invokeMultiple({
      signers: [{ account: new wallet.Account(address).scriptHash, scopes: 1 }],
      invokeArgs: [...args],
    });
  }
}
