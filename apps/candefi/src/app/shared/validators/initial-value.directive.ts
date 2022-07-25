import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function initialValueReqLeverageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const leverage = control.get('leverage');
    const initialValue = control.get('value');
    return leverage &&
      initialValue &&
      Number(leverage.value) === 0 &&
      Number(initialValue.value) > 0
      ? { initialValueReqLeverage: { value: control.value } }
      : null;
  };
}
