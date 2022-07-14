import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface BinanceResponse {
  price: string;
}
@Injectable({
  providedIn: 'root',
})
export class PriceService {
  readonly BINANCE_ENDPOINT = 'https://api.binance.com/api/v3/avgPrice?symbol=';
  constructor(private http: HttpClient) {}

  public neoPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'NEOUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public gasPrice(): Observable<number> {
    return this.btcPrice().pipe(
      switchMap((btcusdt: number) => {
        return this.http
          .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'GASBTC')
          .pipe(map((res) => btcusdt * parseFloat(res.price)));
      })
    );
  }

  public flmPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'FLMUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public btcPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'BTCUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public ethPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'ETHUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public bnbPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'BNBUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public xrpPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'XRPUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public adaPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'ADAUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public solPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(this.BINANCE_ENDPOINT + 'SOLUSDT')
      .pipe(map((res) => parseFloat(res.price)));
  }

  public candyPrice(): Observable<number> {
    const ENDPOINT = 'https://api.flamingo.finance/token-info/prices';
    return this.http
      .get<any[]>(ENDPOINT)
      .pipe(map((res) => res.filter((p) => p.symbol === 'CANDY')[0].usd_price));
  }
}
