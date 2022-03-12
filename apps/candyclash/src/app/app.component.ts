import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MenuItem, PrimeNGConfig } from 'primeng/api';
import { combineLatest, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { CandyClashConfig } from './nft-details/nft-details.component';
import { NgxAnimatedCounterParams } from './ngx-animated-counter/ngx-animated-counter.component';
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
  generation: string;
}

// 11574 * 1000 * 60 * 60 * 24 = ~~1000_000000000
const CLAIM_INC_PER_MS = 11581;
const CLAIM_INC_PER_SEC = 11574074;

const DEFAULT_MENU_ITEMS = [
  {
    label: 'About',
    icon: 'pi pi-heart',
  },
];

@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DecimalPipe],
})
export class AppComponent implements OnInit {
  public TOTAL_CANDIES_POOL = 1000000_000000000;

  public counterParams: NgxAnimatedCounterParams = {
    start: -1,
    end: 0,
    interval: 0,
    increment: 0,
  };
  public menuItems: MenuItem[] = DEFAULT_MENU_ITEMS;
  public tableItems: MenuItem[] = [
    {
      label: 'Stake',
      icon: 'pi pi-play',
      disabled: false,
      command: () => this.stakeTokens(this.selectedNfts),
    },
    {
      label: 'Claim & Unstake',
      icon: 'pi pi-pause',
      command: () => this.unstake(),
    },
    {
      label: 'Refresh',
      icon: 'pi pi-refresh',
      disabled: false,
      command: () => this.refreshAll(),
    },
  ];

  public totalSupply = 0;
  public maxTokensAmount = 0;
  public address = '';
  public nfts: NFT[] = [];
  public displayMintModal = false;
  public mintAmount = 1;
  public gasPrice = 0;
  public candyPrice = 0;
  public villains = 0;
  public villagers = 0;
  public generation = 0;
  public selectedNfts: NFT[] = [];
  public claimableAmount = 0;
  public isLoading = false;

  constructor(
    private primengConfig: PrimeNGConfig,
    private nft: NftService,
    private neoline: NeolineService,
    private staking: StakingService,
    private decimalPipe: DecimalPipe
  ) {
    this.neoline.ACCOUNT_CHANGED_EVENT$.pipe(distinctUntilChanged()).subscribe(
      (address) => {
        this.address = address;
        this.refreshAll();
      }
    );
  }
  ngOnInit() {
    this.primengConfig.ripple = true;
    this.neoline.init();
  }

  public connectWallet(): void {
    this.isLoading = true;
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
      .subscribe(() => this.refreshAll());
  }

  public mint(amount: number): void {
    if (!this.address) {
      this.connectWallet();
    } else {
      const price = this.generation == 0 ? this.gasPrice : this.candyPrice;
      this.nft.mint(this.address, amount, price).subscribe();
    }
  }

  public claim(): void {
    if (!this.address) {
      this.connectWallet();
    } else if (
      this.claimableAmount == 0 ||
      this.nfts.filter((nft) => nft.staked).length === 0
    ) {
      return;
    } else {
      const staked: number[] = this.nfts
        .filter((nft) => nft.staked)
        .map((nft) => nft.tokenId);
      this.staking.claim(this.address, staked, false).subscribe();
    }
  }

  public unstake(): void {
    if (!this.address) {
      this.connectWallet();
    } else if (this.selectedNfts.filter((nft) => nft.staked).length === 0) {
      return;
    } else {
      const staked: number[] = this.selectedNfts
        .filter((nft) => nft.staked)
        .map((nft) => nft.tokenId);
      this.staking
        .claim(this.address, staked, true)
        .subscribe(() => (this.selectedNfts = []));
    }
  }

  /**
   * Refreshes owned NFTs and claimable amount
   */
  private refreshAll(): void {
    if (!this.address) {
      this.connectWallet();
    } else {
      this.isLoading = true;
      this.tokensOf(this.address)
        .pipe(
          tap((nfts) => {
            this.villagers = nfts.filter(
              (nft) => nft.type === 'Villager'
            ).length;
            this.villains = nfts.filter((nft) => nft.type === 'Villain').length;
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe((res) => {
          this.nfts = res;
          this.staking.claimableAmount(this.address).subscribe((res) => {
            this.claimableAmount = res;
            const stakedVillagers = this.nfts.filter(
              (nft) => nft.staked && nft.type === 'Villager'
            );
            // add either 0 or 1 to the increment so the last digit of the counter will change
            const rand = Math.random() < 0.5 ? 1 : 0;
            this.counterParams = {
              end: stakedVillagers.length ? 0 : -1,
              interval: 111,
              start: +res,
              increment: rand + CLAIM_INC_PER_MS * 111 * stakedVillagers.length,
            };
          });
        });
    }
  }

  public onConfigLoaded(config: CandyClashConfig) {
    this.candyPrice = config.candyPrice;
    this.gasPrice = config.gasPrice;
    this.maxTokensAmount = config.maxTokensAmount;
    this.totalSupply = config.totalSupply;
    if (config.totalSupply >= 2000) {
      this.generation = 1;
    }
    const items: MenuItem[] = [...DEFAULT_MENU_ITEMS];
    items.push(
      {
        label:
          'Vault: ' +
          this.decimalPipe.transform(
            config.maxCandiesToEarn / 1000000000,
            '1.0-2'
          ) +
          ' $CANDY',
        disabled: true,
      },
      {
        label:
          'Claimed: ' +
          this.decimalPipe.transform(
            (this.TOTAL_CANDIES_POOL - config.maxCandiesToEarn) / 1000000000,
            '1.0-2'
          ) +
          ' $CANDY',
        disabled: true,
      },
      {
        label: 'Total Mints: ' + this.totalSupply,
        disabled: true,
      },
      {
        label: 'Current Generation: ' + this.generation,
        disabled: true,
      }
    );
    this.menuItems = items;
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
        nfts.filter((nft) => !nft.staked).map((nft) => nft.tokenId)
      )
      .subscribe(() => (this.selectedNfts = []));
  }
}
