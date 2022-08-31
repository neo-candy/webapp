import { Injectable } from '@angular/core';
import { from, merge, Observable, of, throwError, timer } from 'rxjs';
import { rpc } from '@cityofzion/neon-js';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  mergeMap,
  take,
  tap,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NeonJSService {
  constructor(private msg: MessageService) {}
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

  public applicationLog(tx: string): Observable<{ executions: any[] }> {
    return from(
      new rpc.ApplicationLogsRpcClient(
        environment.testnet.nodeUrl
      ).getApplicationLog(tx)
    );
  }

  //TODO: maybe refactor into it's own service class so the ui service can be injected
  public awaitTx(tx: string): Observable<any> {
    return merge(
      timer(0, 1000).pipe(
        exhaustMap(() =>
          this.applicationLog(tx).pipe(catchError(() => of(null)))
        ),
        filter((res) => res != null),
        take(1)
      ),
      timer(60000).pipe(
        tap(() =>
          this.msg.add({
            key: 'infoToast',
            severity: 'info',
            summary: 'Info',
            detail:
              'The confirmation is taking longer than usual. Please try again or notify an administrator.',
            sticky: true,
          })
        )
      )
    ).pipe(take(1));
  }
}
