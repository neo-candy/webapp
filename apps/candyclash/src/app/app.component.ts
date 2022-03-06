import { Component, OnInit } from '@angular/core';
import { NgxAnimatedCounterParams } from '@bugsplat/ngx-animated-counter';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { combineLatest, Observable } from 'rxjs';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { map, switchMap, tap } from 'rxjs/operators';
import { NeolineService } from './services/neoline.service';
import { NftService } from './services/nft.service';
import { StakingService } from './services/staking.service';

export interface NFT {
  tokenId: number;
  name: string;
  image: string;
  type: string;
  staked: boolean;
  sugar?: string;
  bonus?: string;
}
@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public counterParams: NgxAnimatedCounterParams = {
    start: 0,
    end: 0,
    interval: 0,
    increment: 0,
  };
  public items: MenuItem[] = [
    {
      label: 'Stake',
      icon: 'pi pi-play',
      disabled: false,
      command: () => this.stakeTokens(this.selectedNfts),
    },
    {
      label: 'Unstake',
      icon: 'pi pi-pause',
      disabled: false,
    },
  ];
  public totalSupply = 0;
  public maxTokensAmount = 0;
  public address = '';
  public nfts: NFT[] = [];
  public displayMintModal = false;
  public mintAmount = 0;
  public gasPrice = 0;
  public candyPrice = 0;
  public villains = 0;
  public villagers = 0;
  public generation = 0;
  public selectedNfts: NFT[] = [];
  public claimableAmount = 0;

  constructor(
    private primengConfig: PrimeNGConfig,
    private nft: NftService,
    private neoline: NeolineService,
    private staking: StakingService
  ) {}
  ngOnInit() {
    this.primengConfig.ripple = true;
    this.neoline.init();
    this.nft.maxTokensAmount().subscribe((res) => {
      this.maxTokensAmount = res;
    });
    //TODO: get value 2000 from contract
    this.nft.totalSupply().subscribe((res) => {
      if (res >= 2000) {
        this.generation = 1;
      }
      this.totalSupply = res;
    });
    this.nft.gasPrice().subscribe((res) => (this.gasPrice = res));
    this.nft.candyPrice().subscribe((res) => (this.candyPrice = res));
  }

  public connectWallet(): void {
    this.neoline
      .getAccount()
      .pipe(
        tap((res) => (this.address = res.address)),
        switchMap((res) => this.tokensOf(res.address)),
        tap((nfts) => {
          this.villagers = nfts.filter((nft) => nft.type === 'Villager').length;
          this.villains = nfts.filter((nft) => nft.type === 'Villain').length;
        })
      )
      .subscribe((res) => {
        this.nfts = res;
        this.staking.claimableAmount(this.address).subscribe((res) => {
          this.claimableAmount = res;
          this.counterParams = {
            end: -1,
            interval: 1,
            start: +res,
            increment: 11574 * this.nfts.filter((nft) => nft.staked).length,
          };
        });
      });
  }

  public mint(amount: number): void {
    this.nft.mint(this.address, amount).subscribe((res) => console.log(res));
  }

  private tokensOf(address: string): Observable<NFT[]> {
    return combineLatest([
      this.nft.tokensOfJson(address),
      this.staking.tokensOf(address),
    ]).pipe(
      map(([unstaked, staked]) =>
        [...unstaked, ...staked].sort((a, b) => a.tokenId - b.tokenId)
      )
    );
  }

  private stakeTokens(nfts: NFT[]): void {
    this.staking
      .stake(
        this.address,
        nfts.map((nft) => nft.tokenId)
      )
      .subscribe();
  }
}
