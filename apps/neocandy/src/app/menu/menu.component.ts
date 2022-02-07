import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

const BOUNTY_GOOGLE_DOC =
  'https://docs.google.com/document/d/1Qo3-Gdk7uewiTwczt716KGMnQb2ByDVTKKt5xq_pGss/edit?usp=sharing';
const LITE_PAPER =
  'https://docs.google.com/document/d/1aRYe4de3PKGYtCW8jQSzU51jDjO_X1bYW3BhgoVLChs/edit?usp=sharing';

@Component({
  selector: 'nc-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  constructor(private router: Router) {}

  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Features',
        command: () => this.router.navigate([''], { fragment: 'features' }),
      },
      {
        label: 'Get $CANDY',
        command: () => this.router.navigate([''], { fragment: 'free-candy' }),
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
        label: 'Lite Paper',
        command: () => window.open(LITE_PAPER, '_blank'),
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
  }
}
