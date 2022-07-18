import { Injectable } from '@angular/core';

export const THEME_CTX_KEY = 'candefi_theme';
export const LISTING_TYPE_FILTER_CTX_KEY = 'candefi_listing_type_filter';

@Injectable({ providedIn: 'root' })
export class ContextService {
  get(key: string): string {
    return localStorage.getItem(key) ?? '';
  }

  put(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
