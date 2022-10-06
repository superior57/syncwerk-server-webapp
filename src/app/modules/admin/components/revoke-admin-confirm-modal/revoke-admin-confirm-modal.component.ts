import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AdminService, NotificationService } from 'app/services';

@Component({
  selector: 'app-revoke-admin-confirm-modal',
  templateUrl: './revoke-admin-confirm-modal.component.html',
  styleUrls: ['./revoke-admin-confirm-modal.component.scss']
})
export class RevokeAdminConfirmModalComponent implements OnInit {

  isProcessing = false;
  @Input() userForRevoke = '';
  @Output() onRevokeAdminSuccess = new EventEmitter();

  constructor(
    private adminService: AdminService,
    private noti: NotificationService,
  ) { }

  ngOnInit() {
  }

  revokeAdmin() {
    this.adminService.postRevokeAdmin(this.userForRevoke).subscribe(resp => {
      this.onRevokeAdminSuccess.emit({
        message: resp.message,
        revokedUser: this.userForRevoke,
      });
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
      this.isProcessing = false;
    });
  }

}
