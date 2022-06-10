import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NeonJSService } from './neonjs.service';

interface Position {
  creator: string;
  token: string;
  fee: number;
  stake: number;
  expiration: number;
  strike: number;
  direction: 0 | 1;
}

@Injectable({ providedIn: 'root' })
export class CandefiService {
  constructor(private neonjs: NeonJSService) {}

  public getPositions(): Observable<Position[]> {
    const scriptHash = environment.testnet.candefi;
    return this.neonjs.rpcRequest('totalCandyEarned', [], scriptHash);
  }
}
