import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NftService } from '../services/nft.service';
import { StakingService } from '../services/staking.service';

interface NftContractConfig {
  isPaused: number;
  maxGenesisAmount: number;
  nftPricesCandy: number[];
  maxTokensAmount: number;
  totalSupply: number;
  pricePerActionPoint: number;
  pricePerExperiencePoint: number;
  actionPointsLevelTable: number[];
  experienceTable: number[];
  generation: number;
}

interface StakingConfig {
  isPaused: number;
  taxAmount: number;
  totalVillagerCandiesStaked: number;
  totalVillainCandiesStaked: number;
  totalCandiesEarned: number;
  dailyCandyRate: number;
  minStakeBlockCount: number;
  candyBalance: number;
  totalVillainClaims: number;
  totalVillagerClaims: number;
}

const DEFAULT_NFT_VALUES: NftContractConfig = {
  isPaused: 0,
  maxGenesisAmount: 0,
  nftPricesCandy: [],
  maxTokensAmount: 0,
  totalSupply: 0,
  pricePerActionPoint: 0,
  pricePerExperiencePoint: 0,
  experienceTable: [],
  actionPointsLevelTable: [],
  generation: 0,
};

const DEFAULT_STAKING_VALUES: StakingConfig = {
  dailyCandyRate: 0,
  isPaused: 0,
  taxAmount: 0,
  totalCandiesEarned: 0,
  totalVillagerCandiesStaked: 0,
  totalVillainCandiesStaked: 0,
  minStakeBlockCount: 0,
  candyBalance: 0,
  totalVillagerClaims: 0,
  totalVillainClaims: 0,
};

export type CandyClashConfig = StakingConfig & NftContractConfig;

@Component({
  selector: 'cc-nft-details',
  templateUrl: './nft-details.component.html',
  styleUrls: ['./nft-details.component.scss'],
})
export class NftDetailsComponent implements OnInit {
  public config: CandyClashConfig = {
    ...DEFAULT_NFT_VALUES,
    ...DEFAULT_STAKING_VALUES,
  };

  @Output()
  public configLoaded: EventEmitter<CandyClashConfig> = new EventEmitter();

  constructor(private nft: NftService, private staking: StakingService) {}

  loadStakingConfig$: Observable<StakingConfig> = combineLatest([
    this.staking.dailyCandyRate(),
    this.staking.isPaused(),
    this.staking.taxAmount(),
    this.staking.totalCandyEarned(),
    this.staking.totalVillagerCandiesStaked(),
    this.staking.totalVillainCandiesStaked(),
    this.staking.minStakeBlockCount(),
    this.staking.candyBalance(),
    this.staking.totalVillagerClaims(),
    this.staking.totalVillainClaims(),
  ]).pipe(
    map(
      ([
        dailyCandyRate,
        isPaused,
        taxAmount,
        totalCandiesEarned,
        totalVillagerCandiesStaked,
        totalVillainCandiesStaked,
        minStakeBlockCount,
        candyBalance,
        totalVillagerClaims,
        totalVillainClaims,
      ]) => {
        return {
          isPaused,
          dailyCandyRate,
          taxAmount,
          totalCandiesEarned,
          totalVillagerCandiesStaked,
          totalVillainCandiesStaked,
          minStakeBlockCount,
          candyBalance,
          totalVillagerClaims,
          totalVillainClaims,
        };
      }
    )
  );

  loadNftConfig$: Observable<NftContractConfig> = forkJoin([
    this.nft.nftPricesCandy(),
    this.nft.isPaused(),
    this.nft.maxGenesisAmount(),
    this.nft.maxTokensAmount(),
    this.nft.totalSupply(),
    this.nft.pricePerActionPoint(),
    this.nft.pricePerExperiencePoint(),
    this.nft.actionPointsLevelTable(),
    this.nft.experienceTable(),
  ]).pipe(
    map(
      ([
        nftPricesCandy,
        isPaused,
        maxGenesisAmount,
        maxTokensAmount,
        totalSupply,
        pricePerActionPoint,
        pricePerExperiencePoint,
        actionPointsLevelTable,
        experienceTable,
      ]) => ({
        isPaused: isPaused as number,
        maxGenesisAmount: maxGenesisAmount as number,
        nftPricesCandy: nftPricesCandy as number[],
        maxTokensAmount: maxTokensAmount as number,
        totalSupply: totalSupply as number,
        pricePerActionPoint: pricePerActionPoint as number,
        pricePerExperiencePoint: pricePerExperiencePoint as number,
        actionPointsLevelTable: actionPointsLevelTable as number[],
        experienceTable: experienceTable as number[],
        generation: totalSupply < maxGenesisAmount ? 1 : 0,
      })
    )
  );

  ngOnInit(): void {
    forkJoin({
      nftConfig: this.loadNftConfig$,
      stakingConfig: this.loadStakingConfig$,
    })
      .pipe(map((r) => ({ ...r.nftConfig, ...r.stakingConfig })))
      .subscribe((res) => {
        console.log(res);
        this.config = res;
        this.configLoaded.emit(res);
      });
  }
}
