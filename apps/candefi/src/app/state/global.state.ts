import { InjectionToken } from '@angular/core';
import { RxState } from '@rx-angular/state';

export interface Price {
  curr: number;
  prev: number;
}
export interface GlobalState {
  address: string;
  neoPrice: Price;
  gasPrice: Price;
  flmPrice: Price;
  ethPrice: Price;
  btcPrice: Price;
  solPrice: Price;
  adaPrice: Price;
  xrpPrice: Price;
  bnbPrice: Price;
  candyPrice: Price;
  displayLoadingModal: boolean;
}

export const GLOBAL_RX_STATE = new InjectionToken<RxState<GlobalState>>(
  'GLOBAL_RX_STATE'
);
