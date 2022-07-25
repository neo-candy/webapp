import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function minCollateralValidator(
  candyPrice: number,
  gasPrice: number
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const stake = control.get('stake')?.value;
    const collateral = control.get('collateral')?.value;
    const candyValue = Number(stake) * candyPrice;
    const collateralValue = collateral * gasPrice;
    return candyValue * 2 > collateralValue
      ? { minCollateral: { value: control.value } }
      : null;
  };
}
