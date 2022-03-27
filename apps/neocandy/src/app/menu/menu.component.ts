import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const BOUNTY_GOOGLE_DOC =
  'https://docs.google.com/document/d/1Qo3-Gdk7uewiTwczt716KGMnQb2ByDVTKKt5xq_pGss/edit?usp=sharing';
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
        label: 'Free CANDY',
        command: () => this.router.navigate([''], { fragment: 'free-candy' }),
      },
      {
        label: 'Lite Paper',
        command: () => window.open(LITE_PAPER, '_blank'),
      },
      {
        label: 'Games',
        command: () => this.router.navigate([''], { fragment: 'games' }),
      },
      {
        label: 'Bounty Program',
        command: () => window.open(BOUNTY_GOOGLE_DOC, '_blank'),
      },
      {
        label: 'FAQ',
        command: () => this.router.navigate([''], { fragment: 'faq' }),
      },
      {
        label: 'Social',
        command: () => this.router.navigate([''], { fragment: 'social' }),
      },
    ];

    this.getCandyPrice().subscribe((price) => {
      this.items = [
        {
          label: 'Free CANDY',
          command: () => this.router.navigate([''], { fragment: 'free-candy' }),
        },
        {
          label: 'Lite Paper',
          command: () => window.open(LITE_PAPER, '_blank'),
        },
        {
          label: 'Games',
          command: () => this.router.navigate([''], { fragment: 'games' }),
        },
        {
          label: 'Bounty Program',
          command: () => window.open(BOUNTY_GOOGLE_DOC, '_blank'),
        },
        {
          label: 'FAQ',
          command: () => this.router.navigate([''], { fragment: 'faq' }),
        },
        {
          label: 'Social',
          command: () => this.router.navigate([''], { fragment: 'social' }),
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
