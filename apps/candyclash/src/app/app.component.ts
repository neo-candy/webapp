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
import { AlphaSwapService } from './services/alpha-swap.service';
import { NeolineService } from './services/neoline.service';
import { NftService } from './services/nft.service';
import { StakingService } from './services/staking.service';

export interface NFT {
  tokenId: string;
  name: string;
  image: string;
  type: string;
  staked: boolean;
  sugar: number;
  bonus: string;
  generation: number;
  level: number;
  origin: string;
  age: number;
  actions: number;
}

// 11574 * 1000 * 60 * 60 * 24 = ~~1000_000000000
const CLAIM_INC_PER_MS = 11581;
const CLAIM_INC_PER_SEC = 11574074;

@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DecimalPipe],
})
export class AppComponent implements OnInit {
  public menuItems: MenuItem[] = [
    {
      label: 'About',
      icon: 'pi pi-heart',
      command: () => this.openMedium(),
    },
  ];
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
      label: 'Feed sugar',
      icon: 'pi pi-angle-double-up',
      command: () =>
        this.selectedNfts.length > 0
          ? ((this.sugarIncrease = 0), (this.displayNftDetailsModal = true))
          : false,
    },

    {
      label: 'Add action point',
      icon: 'pi pi-plus',
      command: () =>
        this.selectedNfts.length > 0
          ? this.nft
              .addActionPoints(
                this.address,
                this.pricePerActionPoint,
                this.selectedNfts[0].tokenId
              )
              .subscribe()
          : false,
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
  public displayNftDetailsModal = false;
  public mintAmount = 1;
  public nftPricesCandy: number[] = [];
  public villains = 0;
  public villagers = 0;
  public generation = 0;
  public selectedNfts: NFT[] = [];
  public claimableAmount = 0;
  public isLoading = false;
  public sugarIncrease = 0;
  public xpTable: number[] = [];
  public pricePerXp = 0;
  public actionPointsTable: number[] = [];
  public pricePerActionPoint = 0;

  constructor(
    private primengConfig: PrimeNGConfig,
    private nft: NftService,
    private neoline: NeolineService,
    private staking: StakingService,
    private decimalPipe: DecimalPipe,
    private swapService: AlphaSwapService
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

  public openMedium(): void {
    window.open(
      'https://medium.com/neocandy/candyclash-nft-staking-game-a9e87dae3fcb',
      '_blank'
    );
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
      .subscribe(() => {
        this.refreshAll();
        const items = [...this.menuItems];
        items.push({
          label: 'Get Candy',
          icon: 'pi pi-arrow-right',
          command: () => this.swapService.swap(this.address).subscribe(),
        });
        this.menuItems = items;
      });
  }

  public mint(amount: number): void {
    if (!this.address) {
      this.connectWallet();
    } else {
      const price = this.nftPricesCandy[this.generation];
      this.nft.mint(this.address, amount, price).subscribe();
    }
  }

  public confirmSugarAdded(amount: number): void {
    this.sugarIncrease = 0;
    this.nft
      .addSugar(
        this.address,
        amount * this.pricePerXp,
        this.selectedNfts[0].tokenId
      )
      .subscribe();
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
      const staked: string[] = this.nfts
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
      const staked: string[] = this.selectedNfts
        .filter((nft) => nft.staked)
        .map((nft) => nft.tokenId);
      this.staking
        .claim(this.address, staked, true)
        .subscribe(() => (this.selectedNfts = []));
    }
  }

  public getLevelUpXp(amount: number): number {
    for (let i = 0; i < this.xpTable.length; i++) {
      if (amount < this.xpTable[i]) {
        return this.xpTable[i];
      }
    }
    return this.xpTable[this.xpTable.length - 1];
  }

  public addSugar(amount: number) {
    if (
      amount + this.sugarIncrease + this.selectedNfts[0].sugar <=
      this.xpTable[this.xpTable.length - 1]
    ) {
      this.sugarIncrease += amount;
    }
  }

  public getLevelForXp(xp: number): number {
    for (let i = 0; i < this.xpTable.length; i++) {
      if (xp < this.xpTable[i]) {
        return i + 1;
      }
    }
    return this.xpTable.length + 1;
  }

  public addActionPoint(tokenId: string): void {
    this.nft
      .addActionPoints(this.address, this.pricePerActionPoint, tokenId)
      .subscribe();
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
          });
        });
    }
  }

  public onConfigLoaded(config: CandyClashConfig) {
    this.nftPricesCandy = config.nftPricesCandy;
    this.maxTokensAmount = config.maxTokensAmount;
    this.totalSupply = config.totalSupply;
    this.pricePerXp = config.pricePerExperiencePoint;
    this.xpTable = config.experienceTable;
    this.actionPointsTable = config.actionPointsLevelTable;
    this.pricePerActionPoint = config.pricePerActionPoint;
    if (config.totalSupply >= 2000) {
      this.generation = 1;
    }
    const items: MenuItem[] = [...this.menuItems];
    items.push(
      {
        label:
          'Vault: ' +
          this.decimalPipe.transform(
            config.candyBalance / 1000000000,
            '1.0-2'
          ) +
          ' $CANDY',
        disabled: true,
      },
      /* {
        label:
          'Claimed: ' +
          this.decimalPipe.transform(
            (config.totalVillainClaims + config.totalVillagerClaims) /
              1000000000,
            '1.0-2'
          ) +
          ' $CANDY',
        disabled: true,
      }, */
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
        [...unstaked, ...staked].sort((a, b) => +a.tokenId - +b.tokenId)
      )
    );
  }

  private stakeTokens(nfts: NFT[]): void {
    this.staking
      .stake(
        this.address,
        nfts.filter((nft) => !nft.staked).map((nft) => nft.tokenId)
      )
      .subscribe((x) => {
        console.log(x), (this.selectedNfts = []);
      });
  }
}
