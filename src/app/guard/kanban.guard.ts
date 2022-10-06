import { of as observableOf, Observable } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlSegment } from '@angular/router';
import {  NonAuthenticationService } from '../services';

@Injectable()
export class KanbanGuard implements CanActivate {

  constructor(
    private router: Router,
    private nonAuthService: NonAuthenticationService,
  ) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.nonAuthService.getAvailableFeatures().pipe(map(resp => {
      if (!resp.data.kanban) {
        this.router.navigate(['/home']);
      }
      return resp.data.kanban;
    }), catchError((e: any) => {
      this.router.navigate(['/login']);
      return observableOf(false);
    }));
  }
}
