import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService, NotificationService } from '@services/index';

@Component({
  selector: 'app-confirm-email-change-request',
  templateUrl: './confirm-email-change-request.component.html',
  styleUrls: ['./confirm-email-change-request.component.scss']
})
export class ConfirmEmailChangeRequestComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private notify: NotificationService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.authService.postConfirmNewEmailToChange(params).subscribe(
        resp => {
          this.notify.showNotification('success', this.translate.instant(resp.message));
          this.router.navigate(['/', 'settings']);
        },
        error => {
          this.notify.showNotification('danger',  JSON.parse(error._body).message);
          this.router.navigate(['/', 'settings']);
        }
      );
    });
  }

}
