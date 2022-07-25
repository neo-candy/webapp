import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nonZeroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isZero = control.value !== null && Number(control.value) === 0;
    return isZero ? { nonZero: { value: control.value } } : null;
  };
}
