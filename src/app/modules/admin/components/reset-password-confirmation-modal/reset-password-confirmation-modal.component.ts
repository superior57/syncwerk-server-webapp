import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-reset-password-confirmation-modal',
  templateUrl: './reset-password-confirmation-modal.component.html',
  styleUrls: ['./reset-password-confirmation-modal.component.scss']
})
export class ResetPasswordConfirmationModalComponent implements OnInit {

  @Input() userForResetPassword = '';
  @Output() onResetPasswordSuccess = new EventEmitter();

  isProcessing = false;
  params: any;

  constructor(
    private adminService: AdminService,
    private noti: NotificationService,
  ) { }

  ngOnInit() {
  }

  resetPassword() {
    this.isProcessing = true;
    this.adminService.postResetPassword(this.userForResetPassword).subscribe(resp => {
      this.onResetPasswordSuccess.emit({
        message: resp.message
      });
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
      this.isProcessing = false;
    });
  }

}
