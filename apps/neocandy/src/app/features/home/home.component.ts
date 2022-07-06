import { Component, OnInit } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { NeolineService } from '../../services/neoline.service';
import { NftService } from '../../services/nft.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'nc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private neoline: NeolineService,
    private nft: NftService,
    private ui: UiService
  ) {}

  address = '';
  isLoading = false;
  currentPrice = 500000_000000000;
  currentSupply = 222;
  mintingPaused = 1;

  responsiveCarouselOptions = [
    {
      breakpoint: '1024px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  utilities: string[] = [
    'Whitelisted for all future NFT mints of the NeoCandy project. Being whitelisted allows you to mint 24 hours earlier than anyone else.',
    'You will get 1x free Candyland character NFT mint',
    'You will get 1x free Candyclash NFT mint',
    'Receive the @Lollipop discord role and gain access to the exclusive #candy-bar channel',
    'As a NeoCandy NFT holder you will be part of exclusive airdrops',
    'With the @Lollipop role, you will get 3 entries to the discord giveaways when participating',
    'You will receive 100% more candy in the candy-factory (stackable)',
    'Early access to all future NeoCandy games and events',
    'DeFi utilities',
    'As the project grows, we will be continuously adding more utilities',
  ];

  ngOnInit(): void {
    this.nft.currentPrice().subscribe((res) => (this.currentPrice = res));
    this.nft.currentSupply().subscribe((res) => (this.currentSupply = res));
    this.nft.isPaused().subscribe((res) => (this.mintingPaused = res));
  }

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
    window.open('https://ghostmarket.io/account/user/neocandy/', '_blank');
  }
  public openSkyhut(): void {
    window.open(
      'https://www.skyhut.app/collection/0xcdbb7bd33c623510f94626d1953f95a59c27645c',
      '_blank'
    );
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

  connectWallet(): void {
    this.isLoading = true;
    this.neoline
      .getAccount()
      .pipe(map((v) => v.address))
      .subscribe(
        (res) => (
          (this.address = res),
          (this.isLoading = false),
          this.ui.displayInfo('Wallet connected')
        )
      );
  }

  mint(): void {
    this.nft
      .currentPrice()
      .pipe(switchMap((p) => this.nft.mint(this.address, p)))
      .subscribe(console.log);
  }
}
