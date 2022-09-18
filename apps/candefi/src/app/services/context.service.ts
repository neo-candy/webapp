import { Injectable } from '@angular/core';

export const THEME_CTX_KEY = 'candefi_theme';
export const LISTING_TYPE_FILTER_CTX_KEY = 'candefi_listing_type_filter';
export const SELECTED_MINT_MARKET_CTX_KEY = 'candefi_selected_mint_market';
export const SELECTED_MINT_TYPE_CTX_KEY = 'candefi_selected_mint_type';
export const LAST_VISITED_PROFILE_CTX_KEY = 'candefi_last_visited_profile';
export const CALCULATOR_ADVANCED_COLLAPSED_CTX_KEY =
  'candefi_calc_advanced_collapsed';
export const CALCULATOR_SETTINGS_COLLAPSED_CTX_KEY =
  'candefi_calc_settings_collapsed';

@Injectable({ providedIn: 'root' })
export class ContextService {
  get(key: string): string | null {
    return localStorage.getItem(key);
  }

  put(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
