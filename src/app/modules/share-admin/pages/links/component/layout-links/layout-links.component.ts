import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout-links',
  templateUrl: './layout-links.component.html',
  styleUrls: ['./layout-links.component.scss']
})
export class LayoutLinksComponent implements OnInit {

  isAuthChecking = true;
  isAccessAllowed = false;
  tab = 'download';

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit() {
    const p = this.router.url.split('/');
    this.tab = p.pop();
  }


}
