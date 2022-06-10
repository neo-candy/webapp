import { Injectable } from '@angular/core';
import { from, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';
import {
  ACCOUNT_CHANGED,
  CONNECTED,
  N2,
  NeoAccount,
  NeoNetwork,
  NeoPublicKeyData,
  NETWORK_CHANGED,
  READY,
} from '../models/n2';
import {
  N3,
  N3READY,
  NeoAddressToScriptHashResponse,
  NeoGetBalanceResponse,
  NeoInvokeMultipleArgs,
  NeoInvokeReadArgs,
  NeoInvokeReadMultiArgs,
  NeoInvokeReadResponse,
  NeoInvokeWriteResponse,
  NeoPickAddressResponse,
  NeoScriptHashToAddressResponse,
  NeoSigner,
  NeoTypedValue,
} from '../models/n3';

export interface NeoErrorResponse {
  type: string;
  description: string;
  data: string;
}

@Injectable({
  providedIn: 'root',
})
export class NeolineService {
  private readonly N3_READY_EVENT = new ReplaySubject<void>(1);
  private readonly N2_READY_EVENT = new ReplaySubject<void>(1);
  private readonly N3_NEOLINE = new ReplaySubject<N3>(1);
  private readonly N2_NEOLINE = new ReplaySubject<N2>(1);
  private readonly ACCOUNT_CHANGED_EVENT = new Subject<string>();
  private readonly NETWORK_CHANGED_EVENT = new Subject<string>();
  public ACCOUNT_CHANGED_EVENT$ = this.ACCOUNT_CHANGED_EVENT.asObservable();
  public NETWORK_CHANGED_EVENT$ = this.NETWORK_CHANGED_EVENT.asObservable();

  public static bool(value: boolean): NeoTypedValue {
    return { type: 'Boolean', value };
  }

  public static int(value: number): NeoTypedValue {
    return { type: 'Integer', value: value.toString() };
  }

  public static array(value: any[]): NeoTypedValue {
    return { type: 'Array', value };
  }

  public static byteArray(value: string[]): NeoTypedValue {
    return { type: 'ByteArray', value };
  }

  public static string(value: string): NeoTypedValue {
    return { type: 'String', value };
  }

  public static address(value: string): NeoTypedValue {
    return { type: 'Address', value };
  }

  public static hash160(value: string): NeoTypedValue {
    return { type: 'Hash160', value };
  }

  public static hash256(value: string): NeoTypedValue {
    return { type: 'Hash256', value };
  }

  public static any(value: any): NeoTypedValue {
    return { type: 'Any', value };
  }

  constructor() {
    this.registerListeners();
    this.init();
  }

  private registerListeners(): void {
    window.addEventListener(N3READY, () => {
      this.N3_READY_EVENT.next();
    });
    window.addEventListener(READY, () => {
      this.N2_READY_EVENT.next();
    });
    window.addEventListener(CONNECTED, (response) =>
      console.log('CONNECTED', response)
    );
    window.addEventListener(ACCOUNT_CHANGED, (response: any) => {
      this.ACCOUNT_CHANGED_EVENT.next(response.detail.address);
    });
    window.addEventListener(NETWORK_CHANGED, (response: any) => {
      console.log('NETWORK_CHANGED', response);
      this.NETWORK_CHANGED_EVENT.next(response.detail);
    });
  }

  public init(): void {
    let n2;
    let n3;
    this.N2_READY_EVENT.subscribe(() => {
      n2 = new (window as any).NEOLine.Init();
      if (!n2) {
        console.error('common dAPI method failed to load');
        throw new Error();
      } else {
        this.N2_NEOLINE.next(n2);
      }
    });
    this.N3_READY_EVENT.subscribe(() => {
      n3 = new (window as any).NEOLineN3.Init();
      if (!n3) {
        console.error('N3 dAPI method failed to load');
        throw new Error();
      } else {
        this.N3_NEOLINE.next(n3);
      }
    });
  }

  public getNetworks(): Observable<NeoNetwork> {
    return this.N2_NEOLINE.pipe(switchMap((n2) => from(n2?.getNetworks())));
  }

  public getAccount(): Observable<NeoAccount> {
    return this.N2_NEOLINE.pipe(switchMap((n2) => from(n2?.getAccount())));
  }

  public getPublicKey(): Observable<NeoPublicKeyData> {
    return this.N2_NEOLINE.pipe(switchMap((n2) => from(n2?.getPublicKey())));
  }

  public invoke(
    scriptHash: string,
    operation: string,
    args: NeoTypedValue[],
    signers: NeoSigner[],
    fee?: string,
    extraSystemFee?: string,
    broadcastOverride?: boolean
  ): Observable<NeoInvokeWriteResponse> {
    return this.N3_NEOLINE.pipe(
      switchMap((n3) =>
        n3?.invoke({
          scriptHash,
          operation,
          args,
          fee,
          extraSystemFee,
          broadcastOverride,
          signers,
        })
      )
    );
  }

  public invokeRead(
    args: NeoInvokeReadArgs
  ): Observable<NeoInvokeReadResponse> {
    return this.N3_NEOLINE.pipe(
      switchMap((n3) => n3?.invokeRead(args)),
      mergeMap((res) => {
        if (res.state === 'FAULT') {
          console.error(res);
          return throwError(new Error(res.exception));
        } else {
          return of(res);
        }
      })
    );
  }

  public invokeReadMulti(
    args: NeoInvokeReadMultiArgs
  ): Observable<NeoInvokeReadResponse[]> {
    return this.N3_NEOLINE.pipe(
      switchMap((n3) => n3?.invokeReadMulti(args)),
      mergeMap((res) => {
        const faults = res.filter((r) => r.state === 'FAULT');
        if (faults.length > 0) {
          console.error(faults[0].exception);
          return throwError(new Error(faults[0].exception));
        } else {
          return of(res);
        }
      })
    );
  }

  public invokeMultiple(
    args: NeoInvokeMultipleArgs
  ): Observable<NeoInvokeWriteResponse> {
    return this.N3_NEOLINE.pipe(switchMap((n3) => n3?.invokeMultiple(args)));
  }

  public pickAddress(): Observable<NeoPickAddressResponse> {
    return this.N3_NEOLINE.pipe(switchMap((n3) => n3?.pickAddress()));
  }

  public getBalance(): Observable<NeoGetBalanceResponse> {
    return this.N3_NEOLINE.pipe(switchMap((n3) => n3?.getBalance()));
  }

  public addressToScriptHash(
    address: string
  ): Observable<NeoAddressToScriptHashResponse> {
    return this.N3_NEOLINE.pipe(
      switchMap((n3) => n3?.AddressToScriptHash({ address }))
    );
  }

  public scriptHashToAddress(
    address: string
  ): Observable<NeoScriptHashToAddressResponse> {
    return this.N3_NEOLINE.pipe(
      switchMap((n3) => n3?.ScriptHashToAddress({ address }))
    );
  }
}
