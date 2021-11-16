import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

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
        label: 'Get Candy',
        command: () => this.router.navigate([''], { fragment: 'free-candy' }),
      },
      {
        label: 'Games',
        command: () => this.router.navigate([''], { fragment: 'games' }),
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
