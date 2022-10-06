
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CookieService, CookieOptions } from 'ngx-cookie';

import { AuthenticationService } from '../services';


@Injectable()
export class LoggedinGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.checkLogin().pipe(map(resp => {
      if (resp.data.is_auth) {
        this.router.navigate(['/home']);
        return false;
      } else {
        return true;
      }
    }, err => {
      return true;
    }));
  }
}
