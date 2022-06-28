import { Component } from '@angular/core';

@Component({
  selector: 'nc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  address = '';
  isLoading = false;

  utilities: string[] = [
    'Whitelisted for all future NFT mints of the NeoCandy project. Being whitelisted allows you to mint 24 hours earlier than anyone else.',
    'You will get 1x free Candyland character NFT mint',
    'You will get 1x free Candyclash NFT mint',
    'Receive the @Lollipop discord role and gain access to the exclusive #candy-bar channel',
    'As a NeoCandy NFT holder you will be part of exclusive airdrops',
    'With the @Lollipop role, you will get 3 entries to the discord giveaways when participating',
    'You will receive 50% more candy in the candy-factory (faucet)',
    'Early access to all future NeoCandy games and events',
    'No fees in NeoCandy DeFi protocols',
    'As the project grows, we will be continiously adding more utilities',
  ];

  public openDiscord(): void {
    window.open('https://discord.gg/7ssWUpvcfF', '_blank');
  }
  public openTwitter(): void {
    window.open('https://twitter.com/NeoCandyN3', '_blank');
  }
  public openReddit(): void {
    window.open('https://reddit.com/r/NeoCandy', '_blank');
  }
  public openGhostmarket(): void {
    window.open('https://ghostmarket.io/', '_blank');
  }
  public openSkyhut(): void {
    window.open('https://skyhut.app/', '_blank');
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

  public openCandyclashAlpha(): void {
    window.open('https://candyclash.pages.dev/', '_blank');
  }
  public openCandyland(): void {
    window.open('https://docs.neocandy.io/about/games/candyland', '_blank');
  }

  connectWallet(): void {}
}
