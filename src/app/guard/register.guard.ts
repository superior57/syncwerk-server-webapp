
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NonAuthenticationService } from '../services';


@Injectable()
export class RegisterGuard implements CanActivate {

  constructor(
    private router: Router,
    private noAuthService: NonAuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.noAuthService.getSettingsByKeys('ENABLE_SIGNUP').pipe(map(resp => {
      if (!resp.data.config_dict.ENABLE_SIGNUP) {
        this.router.navigate(['/404']);
        return false;
      } else {
        return true;
      }
    }, err => {
      return false;
    }));
  }
}
