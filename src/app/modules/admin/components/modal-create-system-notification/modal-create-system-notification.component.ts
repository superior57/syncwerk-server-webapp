import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-create-system-notification',
  templateUrl: './modal-create-system-notification.component.html',
  styleUrls: ['./modal-create-system-notification.component.scss']
})
export class ModalCreateSystemNotificationComponent implements OnInit {

  isProcessing = false;
  notificationMessage = '';

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  addNotification() {
    if (this.notificationMessage.trim() === '' || this.notificationMessage === null || this.notificationMessage === undefined) {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.NOTIFICATIONS.MESSAGES.EMPTY_MESSAGE'));
      return false;
    }
    this.isProcessing = true;
    this.adminService.postAddNewSystemNotification(this.notificationMessage, false).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.NOTIFICATIONS.MESSAGES.ADD_NOTIFICATION_SUCCESS'));
      this.bsModalRef.hide();
    });
  }

}
