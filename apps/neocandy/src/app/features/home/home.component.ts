import { Component } from '@angular/core';

@Component({
  selector: 'nc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor() {}

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
}
