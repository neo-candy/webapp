import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { finalize, switchMap } from 'rxjs/operators';
import { CandefiService, Token } from '../../services/candefi.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

interface MintState {
  displayMintModal: boolean;
  address: string;
  owner: Token[];
  writer: Token[];
  isLoadingWriter: boolean;
  isLoadingOwner: boolean;
}

const DEFAULT_STATE: MintState = {
  displayMintModal: false,
  address: '',
  owner: [],
  writer: [],
  isLoadingWriter: true,
  isLoadingOwner: true,
};
@Component({
  selector: 'cd-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent extends RxState<MintState> implements OnInit {
  form: FormGroup = new FormGroup({});

  readonly state$ = this.select();

  constructor(
    private candefi: CandefiService,
    private fb: FormBuilder,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect('address', this.globalState.select('address'));
    /* this.connect(
      'writer',
      this.globalState
        .select('address')
        .pipe(
          switchMap((a) =>
            this.candefi
              .tokensOfWriterJson(a)
              .pipe(finalize(() => this.set({ isLoadingWriter: false })))
          )
        )
    ); */
    this.connect(
      'owner',
      this.globalState
        .select('address')
        .pipe(
          switchMap((a) =>
            this.candefi
              .tokensOfJson(a)
              .pipe(finalize(() => this.set({ isLoadingOwner: false })))
          )
        )
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      type: [{ value: 'Call', disabled: true }],
      asset: [{ value: 'NEO', disabled: true }],
      strike: [0, Validators.required],
      stake: [5000, Validators.required],
      fee: [{ value: 1000, disabled: true }],
      vdot: [0],
      value: [0],
      vi: [0],
      safe: [false],
      agreement: [false, Validators.requiredTrue],
      duration: [[1, 28]],
      dailyFee: [0.01],
      collateral: [0.01],
    });
  }

  displayMintCallModal(): void {
    this.form.patchValue({
      type: 'Call',
      strike: Math.ceil(this.globalState.get('neoPrice') + 0.5),
      value: this.stake / 2,
    });
    this.set({ displayMintModal: true });
  }

  displayMintPutModal(): void {
    this.form.patchValue({
      type: 'Put',
      strike: Math.floor(this.globalState.get('neoPrice') - 0.5),
      value: this.stake / 2,
    });
    this.set({ displayMintModal: true });
  }

  mint(): void {
    if (this.type == 'Call') {
      this.mintCall();
    } else if (this.type == 'Put') {
      this.mintPut();
    }
  }

  get stake(): number {
    return this.form.get('stake')?.value;
  }

  get type(): string {
    return this.form.get('type')?.value;
  }

  get strike(): number {
    return this.form.get('strike')?.value;
  }

  get vdot(): number {
    return this.form.get('vdot')?.value;
  }

  get vi(): number {
    return this.form.get('vi')?.value;
  }

  get value(): number {
    return this.form.get('value')?.value;
  }

  get safe(): boolean {
    return this.form.get('safe')?.value;
  }

  get duration(): number[] {
    return this.form.get('duration')?.value;
  }

  get dailyFee(): number {
    return this.form.get('dailyFee')?.value;
  }

  get collateral(): number {
    return this.form.get('collateral')?.value;
  }

  private mintCall(): void {
    const stake = this.stake * Math.pow(10, 9);
    const strike = this.strike * Math.pow(10, 8);
    const value = this.value * Math.pow(10, 9);
    const minDurationInMinutes = this.duration[0] * 24 * 60;
    const maxDurationInMinutes = this.duration[1] * 24 * 60;
    const feePerMinute = (this.dailyFee * Math.pow(10, 8)) / 24 / 60;
    const collateral = this.collateral * Math.pow(10, 8);
    this.candefi
      .mintCall(
        this.get('address'),
        strike,
        stake,
        this.vdot,
        value,
        this.vi,
        this.safe,
        collateral,
        minDurationInMinutes,
        maxDurationInMinutes,
        feePerMinute
      )
      .subscribe((res) => console.log(res));
  }

  private mintPut(): void {
    const stake = this.stake * Math.pow(10, 9);
    const strike = this.strike * Math.pow(10, 8);
    const value = this.value * Math.pow(10, 9);
    const minDurationInMinutes = this.duration[0] * 24 * 60;
    const maxDurationInMinutes = this.duration[1] * 24 * 60;
    const feePerMinute = (this.dailyFee * Math.pow(10, 8)) / 24 / 60;
    const collateral = this.collateral * Math.pow(10, 8);
    this.candefi
      .mintPut(
        this.get('address'),
        strike,
        stake,
        this.vdot,
        value,
        this.vi,
        this.safe,
        collateral,
        minDurationInMinutes,
        maxDurationInMinutes,
        feePerMinute
      )
      .subscribe((res) => console.log(res));
  }
}
