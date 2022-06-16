import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxState } from '@rx-angular/state';
import { CandefiService } from '../../services/candefi.service';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

interface MintState {
  displayMintModal: boolean;
  address: string;
}

const DEFAULT_STATE: MintState = {
  displayMintModal: false,
  address: '',
};
@Component({
  selector: 'cd-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss'],
})
export class MintComponent extends RxState<MintState> implements OnInit {
  readonly state$ = this.select();
  form: FormGroup = new FormGroup({});

  constructor(
    private candefi: CandefiService,
    private fb: FormBuilder,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {
    super();
    this.set(DEFAULT_STATE);
    this.connect('address', this.globalState.select('address'));
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      type: [{ value: 'Call', disabled: true }],
      asset: [{ value: 'NEO', disabled: true }],
      strike: [0, Validators.required],
      stake: [5000, Validators.required],
      fee: [{ value: 1000, disabled: true }],
    });
  }

  displayMintCallModal(): void {
    this.form.patchValue({
      type: 'Call',
      strike: Math.ceil(this.globalState.get('neoPrice') + 0.5),
    });
    this.set({ displayMintModal: true });
  }

  displayMintPutModal(): void {
    this.form.patchValue({
      type: 'Put',
      strike: Math.floor(this.globalState.get('neoPrice') - 0.5),
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

  private mintCall(): void {
    const stake = this.stake * Math.pow(10, 9);
    const strike = this.strike * Math.pow(10, 8);
    this.candefi
      .mintCall(this.get('address'), strike, stake)
      .subscribe((res) => console.log(res));
  }

  private mintPut(): void {
    const stake = this.stake * Math.pow(10, 9);
    const strike = this.strike * Math.pow(10, 8);
    this.candefi
      .mintPut(this.get('address'), strike, stake)
      .subscribe((res) => console.log(res));
  }
}
