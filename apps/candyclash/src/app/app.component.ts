import { Component, OnInit } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';

interface NFT {
  image: string;
  type: string;
  staked: boolean;
  sugar: string;
  multiplier: string;
}
@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public items: MenuItem[] = [];
  public nfts: NFT[] = [
    {
      image:
        'https://gateway.pinata.cloud/ipfs/Qmeqst3PBH9CQUxmZrcoT45HeGFVd89aUYrHN6vwFuhTDJ/0.png',
      multiplier: '120%',
      staked: true,
      sugar: '5',
      type: 'Villain',
    },
    {
      image:
        'https://gateway.pinata.cloud/ipfs/Qmeqst3PBH9CQUxmZrcoT45HeGFVd89aUYrHN6vwFuhTDJ/0.png',
      multiplier: '120%',
      staked: true,
      sugar: '5',
      type: 'Villain',
    },
    {
      image:
        'https://gateway.pinata.cloud/ipfs/Qmeqst3PBH9CQUxmZrcoT45HeGFVd89aUYrHN6vwFuhTDJ/0.png',
      multiplier: '120%',
      staked: true,
      sugar: '5',
      type: 'Villain',
    },
    {
      image:
        'https://gateway.pinata.cloud/ipfs/Qmeqst3PBH9CQUxmZrcoT45HeGFVd89aUYrHN6vwFuhTDJ/0.png',
      multiplier: '120%',
      staked: true,
      sugar: '5',
      type: 'Villain',
    },
    {
      image:
        'https://gateway.pinata.cloud/ipfs/Qmeqst3PBH9CQUxmZrcoT45HeGFVd89aUYrHN6vwFuhTDJ/0.png',
      multiplier: '120%',
      staked: true,
      sugar: '5',
      type: 'Villain',
    },
    {
      image:
        'https://gateway.pinata.cloud/ipfs/Qmeqst3PBH9CQUxmZrcoT45HeGFVd89aUYrHN6vwFuhTDJ/0.png',
      multiplier: '120%',
      staked: true,
      sugar: '5',
      type: 'Villain',
    },
    {
      image:
        'https://gateway.pinata.cloud/ipfs/Qmeqst3PBH9CQUxmZrcoT45HeGFVd89aUYrHN6vwFuhTDJ/0.png',
      multiplier: '120%',
      staked: true,
      sugar: '5',
      type: 'Villain',
    },
  ];

  constructor(private primengConfig: PrimeNGConfig) {}
  ngOnInit() {
    this.primengConfig.ripple = true;

    this.items = [
      {
        label: 'Stake',
        icon: 'pi pi-play',
        disabled: true,
      },
      {
        label: 'Unstake',
        icon: 'pi pi-pause',
        disabled: true,
      },
    ];
  }
}
