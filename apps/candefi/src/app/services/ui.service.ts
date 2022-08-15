import { Inject, Injectable } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { NeoInvokeWriteResponse } from '../models/n3';
import { GlobalState, GLOBAL_RX_STATE } from '../state/global.state';
import { NeonJSService } from './neonjs.service';

interface Error {
  description: {
    exception: string;
  };
}
@Injectable({
  providedIn: 'root',
})
export class UiService {
  constructor(
    private messageService: MessageService,
    private neonjs: NeonJSService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {}

  public displayError(err: Error): void {
    this.messageService.add({
      key: 'errorToast',
      severity: 'error',
      summary: 'Error',
      detail: err.description.exception
        ? this.mapToReadableErrorMessage(err.description.exception)
        : 'Ops, something went wrong! Try again or notify an administrator.',
      sticky: true,
    });
  }

  public displaySuccess(msg: string, txId?: string): void {
    this.messageService.add({
      key: 'successToast',
      severity: 'success',
      summary: 'Success',
      detail: msg,
      life: 10000,
      data: txId,
    });
  }

  public displayInfo(msg: string, summary?: string): void {
    this.messageService.add({
      key: 'infoToast',
      severity: 'info',
      summary: summary ?? 'Info',
      detail: msg,
      life: 10000,
    });
  }

  public displayTxLoadingModal(
    txid: string
  ): Observable<NeoInvokeWriteResponse> {
    this.globalState.set({ displayLoadingModal: true });
    return this.neonjs
      .awaitTx(txid)
      .pipe(
        finalize(() => this.globalState.set({ displayLoadingModal: false }))
      );
  }

  private mapToReadableErrorMessage(err: string): string {
    if (!err.includes('An unhandled exception was thrown.')) {
      return err;
    }
    const message = err.replace('An unhandled exception was thrown.', '');
    return message;
  }
}
