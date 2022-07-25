import { Injectable } from '@angular/core';

export const THEME_CTX_KEY = 'candefi_theme';
export const LISTING_TYPE_FILTER_CTX_KEY = 'candefi_listing_type_filter';
export const SELECTED_MINT_MARKET = 'candefi_selected_mint_market';
export const SELECTED_MINT_TYPE = 'candefi_selected_mint_type';

@Injectable({ providedIn: 'root' })
export class ContextService {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  put(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
