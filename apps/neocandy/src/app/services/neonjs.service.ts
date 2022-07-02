import { Injectable } from '@angular/core';
import { from, Observable, of, throwError, timer } from 'rxjs';
import { rpc } from '@cityofzion/neon-js';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  mergeMap,
  take,
} from 'rxjs/operators';
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
    const rpcClient = new rpc.RPCClient(environment.mainnet.nodeUrl);
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

  public applicationLog(tx: string): Observable<{ executions: any[] }> {
    return from(
      new rpc.ApplicationLogsRpcClient(
        environment.mainnet.nodeUrl
      ).getApplicationLog(tx)
    );
  }

  public awaitTx(tx: string): Observable<any> {
    return timer(0, 1000).pipe(
      exhaustMap(() =>
        this.applicationLog(tx).pipe(catchError(() => of(null)))
      ),
      filter((res) => res != null),
      take(1)
    );
  }
}
