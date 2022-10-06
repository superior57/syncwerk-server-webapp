import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AdminService, NotificationService } from '@services/index';

@Component({
  selector: 'app-sudo',
  templateUrl: './sudo.component.html',
  styleUrls: ['./sudo.component.scss']
})
export class SudoComponent implements OnInit {

  isProcessing = false;
  password = '';

  targetRoute = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notify: NotificationService,
    private translate: TranslateService,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.targetRoute = params.next || '';
    });
  }

  onKeyup(key) {
    if (key.keyCode === 13) {
      // 13 is Enter key
      this.unlockAdmin();
    }
  }

  unlockAdmin() {
    this.isProcessing = true;
    this.adminService.postUnlockSudo(this.password).subscribe(resp => {
      if (this.targetRoute) {
        this.router.navigateByUrl(this.targetRoute);
      } else {
        this.router.navigate(['/admin']);
      }
    }, err => {
      if (err.status === 403) {
        this.notify.showNotification('danger', this.translate.instant('ADMIN.SUDO.MESSAGES.INCORRECT_PASSWORD'));
      } else {
        this.notify.showNotification('danger', this.translate.instant('ADMIN.SUDO.MESSAGES.INTERNAL_SERVER_ERROR'));
      }
      this.isProcessing = false;
    });
  }

}
