import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { RxState } from '@rx-angular/state';
import { Observable } from 'rxjs';
import { GlobalState, GLOBAL_RX_STATE } from '../../state/global.state';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(GLOBAL_RX_STATE) private globalState: RxState<GlobalState>
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const address = this.globalState.get('address');

    if (address) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
