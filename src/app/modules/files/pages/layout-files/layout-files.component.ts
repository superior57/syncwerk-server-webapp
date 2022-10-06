import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, NonAuthenticationService } from 'app/services';

@Component({
  selector: 'app-layout-files',
  templateUrl: './layout-files.component.html',
  styleUrls: ['./layout-files.component.scss']
})
export class LayoutFilesComponent implements OnInit {

  featureList: any = {};

  constructor(
    private router: Router,
    private authenService: AuthenticationService,
    private nonAuthService: NonAuthenticationService,
  ) { }

  ngOnInit() {
    this.authenService.checkLogin().subscribe(resps => {
      if (resps.data.is_guest) {
        this.router.navigate(['/files', 'shared-files']);
      } else {
        this.router.navigate(['/folders']);
      }
    });
  }
}
