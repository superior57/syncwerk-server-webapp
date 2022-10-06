
import { of as observableOf, Observable } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CookieService, CookieOptions } from 'ngx-cookie';

import { AuthenticationService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const url: string = state.url;
    localStorage.setItem('url', JSON.stringify(url));

    return this.authService.checkLogin().pipe(map(resp => {
      if (!resp.data.is_auth) {
        this.router.navigate(['/login']);
      }
      return resp.data.is_auth;
    }), catchError((e: any) => {
      this.router.navigate(['/login']);
      return observableOf(false);
    }));

  }
}
