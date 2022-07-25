import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function strikePriceValidator(neoPrice: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const leverage = control.get('leverage');
    const strike = control.get('strike');
    const type = control.get('type');

    if (type?.value === 'call') {
      return strike?.value <= neoPrice && leverage?.value === 0
        ? { strikePrice: { value: control.value } }
        : null;
    } else {
      return strike?.value >= neoPrice && leverage?.value === 0
        ? { strikePrice: { value: control.value } }
        : null;
    }
  };
}
