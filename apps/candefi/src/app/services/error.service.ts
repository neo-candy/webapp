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
      detail: this.mapToReadableErrorMessage(err.description.exception),
      sticky: true,
    });
  }

  private mapToReadableErrorMessage(err: string): string {
    const message = err.replace('An unhandled exception was thrown.', '');
    return message;
  }
}
