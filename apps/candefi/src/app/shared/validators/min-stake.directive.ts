import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CandefiService } from '../../services/candefi.service';

export class MinStakeValidator {
  static createValidator(candefi: CandefiService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return candefi.minStake().pipe(
        map((result: number) => (result /= Math.pow(10, 9))),
        map((result: number) =>
          result > Number(control.value) ? { minimumStake: true } : null
        )
      );
    };
  }
}
