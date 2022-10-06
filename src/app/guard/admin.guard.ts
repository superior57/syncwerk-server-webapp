
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CookieService, CookieOptions } from 'ngx-cookie';
import { Observable } from 'rxjs';

import { AdminService } from '../services';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private adminService: AdminService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const url: string = state.url;
    return this.adminService.getSudoCheck().pipe(map(resp => {
      console.log('sudo result', resp);
      if (!resp.data.sudo_result) {
        this.router.navigate(['/admin', 'sudo'], {
          queryParams: {
            next: url
          }
        });
        return false;
      }
      return true;
    }));
  }
}
