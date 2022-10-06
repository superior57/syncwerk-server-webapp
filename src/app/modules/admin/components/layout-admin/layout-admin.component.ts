import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Action, Type } from '@enum/index.enum';
import { AuthenticationService, MessageService, NonAuthenticationService } from 'app/services';

@Component({
  selector: 'app-layout-admin',
  templateUrl: './layout-admin.component.html',
  styleUrls: ['./layout-admin.component.scss']
})
export class LayoutAdminComponent implements OnInit {

  isAuthChecking = true;
  isAccessAllowed = false;
  params: any;

  isEnabledAdminArea = false;

  constructor(
    private authService: AuthenticationService,
    private messageService: MessageService,
    private router: Router,
    private nonAuthService: NonAuthenticationService,

  ) { }

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    this.authService.checkLogin().subscribe(resp => {
      if (resp.data.is_guest === true) {
        this.messageService.send(Type.Main_Page, Action.Page_Not_Found, true);
      }
      if (!resp.data.is_auth || !resp.data.is_staff) {
        this.isAuthChecking = false;
        this.isAccessAllowed = false;
        this.router.navigate(['not-found']);
      } else {
        this.isAuthChecking = false;
        this.isAccessAllowed = true;
      }
    }, err => {
      this.isAuthChecking = false;
      this.isAccessAllowed = false;
      this.router.navigate(['not-found']);
    });
  }

}
