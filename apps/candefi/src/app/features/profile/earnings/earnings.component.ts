import { Component, Inject } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { environment } from '../../../../environments/environment';
import { finalize, map, switchMap } from 'rxjs/operators';
import { RentfuseService } from '../../../services/rentfuse.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../../state/global.state';

interface Earnings {
  token: string;
  earnings: number;
  hash: string;
  value: number;
  claimableEarnings: number;
  totalEarnings: number;
}
interface EarningsState {
  isLoading: boolean;
  earnings: Earnings[];
}

const DEFAULT_STATE: EarningsState = {
  isLoading: true,
  earnings: [
    {
      token: 'gas',
      hash: '',
      earnings: 0,
      totalEarnings: 0,
      claimableEarnings: 0,
      value: 0,
    },
    {
      token: 'refu',
      earnings: 0,
      hash: '',
      totalEarnings: 0,
      claimableEarnings: 0,
      value: 0,
    },
  ],
};
@Component({
  selector: 'cd-earnings',
  templateUrl: './earnings.component.html',
  styleUrls: ['./earnings.component.scss'],
})
export class EarningsComponent extends RxState<EarningsState> {
  readonly state$ = this.select();
  readonly fetchClaimableGasAmount$ = this.globalState
    .select('address')
    .pipe(
      switchMap((address) =>
        this.rentfuse
          .getClaimableAmount(address, environment.testnet.gas)
          .pipe(finalize(() => this.set({ isLoading: false })))
      )
    );
  constructor(
    private rentfuse: RentfuseService,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect(
      'earnings',
      this.fetchClaimableGasAmount$.pipe(map((v) => this.mapToEarnings(v)))
    );
  }

  claim(earning: Earnings): void {
    this.rentfuse
      .claimAmount(
        this.globalState.get('address'),
        earning.claimableEarnings,
        earning.hash,
        earning.token.toUpperCase()
      )
      .subscribe(console.log);
  }

  private mapToEarnings(gas: number): Earnings[] {
    return [
      {
        token: 'gas',
        earnings: 0,
        totalEarnings: 0,
        claimableEarnings: gas,
        value: this.globalState.get('gasPrice').curr * gas,
        hash: environment.testnet.gas,
      },
      {
        token: 'refu',
        earnings: 0,
        totalEarnings: 0,
        claimableEarnings: 0,
        value: 0,
        hash: '',
      },
    ];
  }
}
