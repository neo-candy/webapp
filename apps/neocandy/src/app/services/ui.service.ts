import { Injectable } from '@angular/core';

import { MessageService } from 'primeng/api';

interface Error {
  description: {
    exception: string;
  };
}
@Injectable({
  providedIn: 'root',
})
export class UiService {
  constructor(private messageService: MessageService) {}

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

  public displaySuccess(msg: string, summary?: string): void {
    this.messageService.add({
      key: 'successToast',
      severity: 'success',
      summary: summary ?? 'Success',
      detail: msg,
      life: 5000,
    });
  }

  public displayInfo(msg: string, summary?: string): void {
    this.messageService.add({
      key: 'infoToast',
      severity: 'info',
      summary: summary ?? 'Info',
      detail: msg,
      life: 5000,
    });
  }

  private mapToReadableErrorMessage(err: string): string {
    if (!err.includes('An unhandled exception was thrown.')) {
      return err;
    }
    const message = err.replace('An unhandled exception was thrown.', '');
    return message;
  }
}
