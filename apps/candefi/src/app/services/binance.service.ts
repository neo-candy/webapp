import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface BinanceResponse {
  price: string;
}
@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  constructor(private http: HttpClient) {}

  public neoPrice(): Observable<number> {
    return this.http
      .get<BinanceResponse>(
        'https://api.binance.com/api/v3/avgPrice?symbol=NEOUSDT'
      )
      .pipe(map((res) => parseFloat(res.price)));
  }
}
