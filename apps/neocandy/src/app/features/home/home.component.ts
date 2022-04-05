import { Component } from '@angular/core';

@Component({
  selector: 'nc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public openDiscord(): void {
    window.open('https://discord.gg/7ssWUpvcfF', '_blank');
  }
  public openTwitter(): void {
    window.open('https://twitter.com/NeoCandyN3', '_blank');
  }
  public openReddit(): void {
    window.open('https://reddit.com/r/NeoCandy', '_blank');
  }
  public openTelegram(): void {
    window.open('https://t.me/NeoCandyN3', '_blank');
  }
  public openCandyclash(): void {
    window.open(
      'https://medium.com/neocandy/candyclash-nft-staking-game-a9e87dae3fcb',
      '_blank'
    );
  }
  public openCandyland(): void {
    window.open('https://docs.neocandy.io/about/games/candyland', '_blank');
  }
}
