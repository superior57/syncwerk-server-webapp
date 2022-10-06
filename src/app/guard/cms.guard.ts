
import { of as observableOf, Observable } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { CookieService, CookieOptions } from 'ngx-cookie';

import { AuthenticationService } from '../services';

@Injectable()
export class CMSGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthenticationService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const url: string = state.url;
    console.log(url);
    return this.authService.checkLoginWithoutRedirect().pipe(map(resp => {
      const routeArr = url.split('/');
      this.router.navigate(['/cms', routeArr[1]]);
      return false;
    }), catchError((e: any) => {
      return observableOf(true);
    }));
  }
}
