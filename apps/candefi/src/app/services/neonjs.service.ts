import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { rpc } from '@cityofzion/neon-js';
import { map, mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NeonJSService {
  public rpcRequest(
    method: string,
    params: any[],
    scriptHash: string
  ): Observable<any> {
    const rpcClient = new rpc.RPCClient(environment.testnet.nodeUrl);
    return from(rpcClient.invokeFunction(scriptHash, method, params)).pipe(
      mergeMap((res) => {
        if (res.state === 'FAULT') {
          console.error(res);
          return throwError(res.exception);
        } else return of(res);
      }),
      map((res) => res.stack[0]?.value)
    );
  }
}
