import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const LITE_PAPER = 'https://docs.neocandy.io';
const FLAMINGO = 'https://flamingo.finance';

interface FlamingoPriceResponse {
  symbol: string;
  usd_price: number;
}
@Component({
  selector: 'nc-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  constructor(private router: Router, private http: HttpClient) {}

  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Get CANDY',
        command: () => this.router.navigate([''], { fragment: 'get-candy' }),
      },
      {
        label: 'Whitepaper',
        command: () => window.open(LITE_PAPER, '_blank'),
      },
      {
        label: 'NFTs',
        command: () => this.router.navigate([''], { fragment: 'nfts' }),
      },
      {
        label: 'Games',
        command: () => this.router.navigate([''], { fragment: 'games' }),
      },
      {
        label: 'DeFi',
        disabled: true,
      },
    ];

    this.getCandyPrice().subscribe((price) => {
      this.items = [
        {
          label: 'Get CANDY',
          command: () => this.router.navigate([''], { fragment: 'get-candy' }),
        },
        {
          label: 'Whitepaper',
          command: () => window.open(LITE_PAPER, '_blank'),
        },
        {
          label: 'NFTs',
          command: () => this.router.navigate([''], { fragment: 'nfts' }),
        },
        {
          label: 'Games',
          command: () => this.router.navigate([''], { fragment: 'games' }),
        },
        {
          label: 'DeFi',
          disabled: true,
        },
        {
          label: '$' + price.toFixed(9),
          command: () => window.open(FLAMINGO, '_blank'),
        },
      ];
    });
  }

  private getCandyPrice(): Observable<number> {
    const ENDPOINT = 'https://api.flamingo.finance/token-info/prices';
    return this.http
      .get<FlamingoPriceResponse[]>(ENDPOINT)
      .pipe(map((res) => res.filter((p) => p.symbol === 'CANDY')[0].usd_price));
  }
}
