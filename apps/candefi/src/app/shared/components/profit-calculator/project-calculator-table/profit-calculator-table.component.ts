import { Component, Input } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { TableValue } from '../profit-calculator.component';

interface ProfitCalculatorTableState {
  isLoading: boolean;
  values: TableValue[];
  cols: number[];
}

const DEFAULT_STATE: ProfitCalculatorTableState = {
  isLoading: true,
  values: [],
  cols: [],
};

@Component({
  selector: 'cd-profit-calculator-table',
  templateUrl: './profit-calculator-table.component.html',
  styleUrls: ['./profit-calculator-table.component.scss'],
})
export class ProfitCalculatorTableComponent extends RxState<ProfitCalculatorTableState> {
  @Input() set cols(cols: number[]) {
    this.set({ cols });
  }

  @Input() set values(values: TableValue[]) {
    this.set({ values });
  }

  @Input() set isLoading(isLoading: boolean) {
    this.set({ isLoading });
  }

  readonly state$ = this.select();
  constructor() {
    super();
    this.set(DEFAULT_STATE);
  }
}
