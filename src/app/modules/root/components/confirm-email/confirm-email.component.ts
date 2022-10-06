import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService, AuthenticationService } from 'app/services';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {

  constructor(
    private notify: NotificationService,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (!params.activationKey) {
        this.notify.showNotification('danger', 'Invalid activation key.');
        this.router.navigate(['/login']);
      }
      this.authService.activeAccountByEmail(params.activationKey).subscribe(resp => {
        this.notify.showNotification('success', 'Activation success.');
        this.router.navigate(['/']);
      }, err => {
        this.notify.showNotification('danger', 'Activation failed. Please contact administrator.');
        this.router.navigate(['/login']);
      });
    });
  }

}
