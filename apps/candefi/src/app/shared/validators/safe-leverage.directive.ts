import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function safeLeverageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const leverage = control.get('leverage');
    const safe = control.get('safe');
    return leverage &&
      safe &&
      Number(leverage.value) === 0 &&
      Boolean(safe.value) === false
      ? { safeLeverage: { value: control.value } }
      : null;
  };
}
