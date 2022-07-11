import { Injectable } from '@angular/core';

export const THEME_CTX_KEY = 'candefi_theme';

@Injectable({ providedIn: 'root' })
export class ContextService {
  get(key: string): string {
    return localStorage.getItem(key) ?? '';
  }

  put(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
