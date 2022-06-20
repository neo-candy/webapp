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
export class ErrorService {
  constructor(private messageService: MessageService) {}

  public displayError(err: Error): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: err.description.exception
        ? this.mapToReadableErrorMessage(err.description.exception)
        : 'An unhandled error occured.',
      sticky: true,
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
