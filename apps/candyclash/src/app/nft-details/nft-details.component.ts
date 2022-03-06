import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NftService } from '../services/nft.service';
import { StakingService } from '../services/staking.service';

interface NftContractConfig {
  isPaused: number;
  maxGenesisAmount: number;
  gasPrice: number;
  candyPrice: number;
}

interface StakingConfig {
  isPaused: number;
  taxAmount: number;
  totalVillagerCandiesStaked: number;
  totalVillainCandiesStaked: number;
  totalCandiesEarned: number;
  dailyCandyRate: number;
  minStakeBlockCount: number;
  maxCandiesToEarn: number;
}

const DEFAULT_NFT_VALUES: NftContractConfig = {
  isPaused: 0,
  maxGenesisAmount: 0,
  gasPrice: 0,
  candyPrice: 0,
};

const DEFAULT_STAKING_VALUES: StakingConfig = {
  dailyCandyRate: 0,
  isPaused: 0,
  taxAmount: 0,
  totalCandiesEarned: 0,
  totalVillagerCandiesStaked: 0,
  totalVillainCandiesStaked: 0,
  minStakeBlockCount: 0,
  maxCandiesToEarn: 0,
};
@Component({
  selector: 'cc-nft-details',
  templateUrl: './nft-details.component.html',
  styleUrls: ['./nft-details.component.scss'],
})
export class NftDetailsComponent implements OnInit {
  public nftConfig: NftContractConfig = DEFAULT_NFT_VALUES;
  public stakingConfig: StakingConfig = DEFAULT_STAKING_VALUES;

  constructor(private nft: NftService, private staking: StakingService) {}

  loadStakingConfig$: Observable<StakingConfig> = combineLatest([
    this.staking.dailyCandyRate(),
    this.staking.isPaused(),
    this.staking.taxAmount(),
    this.staking.totalCandiesEarned(),
    this.staking.totalVillagerCandiesStaked(),
    this.staking.totalVillainCandiesStaked(),
    this.staking.minStakeBlockCount(),
    this.staking.maxCandiesToEarn(),
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
        maxCandiesToEarn,
      ]) => {
        return {
          isPaused,
          dailyCandyRate,
          taxAmount,
          totalCandiesEarned,
          totalVillagerCandiesStaked,
          totalVillainCandiesStaked,
          minStakeBlockCount,
          maxCandiesToEarn,
        };
      }
    )
  );

  loadNftConfig$: Observable<NftContractConfig> = combineLatest([
    this.nft.candyPrice(),
    this.nft.gasPrice(),
    this.nft.isPaused(),
    this.nft.maxGenesisAmount(),
  ]).pipe(
    map(([candyPrice, gasPrice, isPaused, maxGenesisAmount]) => {
      return {
        isPaused,
        gasPrice,
        candyPrice,
        maxGenesisAmount,
      };
    })
  );

  ngOnInit(): void {
    this.loadNftConfig$.subscribe((c) => {
      this.nftConfig = c;
    });

    this.loadStakingConfig$.subscribe((c) => (this.stakingConfig = c));
  }
}
