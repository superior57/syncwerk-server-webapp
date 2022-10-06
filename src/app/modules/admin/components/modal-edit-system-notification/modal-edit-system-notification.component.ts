import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-edit-system-notification',
  templateUrl: './modal-edit-system-notification.component.html',
  styleUrls: ['./modal-edit-system-notification.component.scss']
})
export class ModalEditSystemNotificationComponent implements OnInit {

  selectedNotification: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  updateNotification() {
    console.log(this.selectedNotification);
    this.isProcessing = true;
    this.adminService.putUpdateSystemNotification(
      this.selectedNotification.id,
      this.selectedNotification.is_default ? 1 : 0,
      this.selectedNotification.notificationMessage).subscribe(resp => {
        this.notify.showNotification('success', this.translate.instant('ADMIN.NOTIFICATIONS.MESSAGES.UPDATE_NOTIFICATION_SUCCESS'));
        this.bsModalRef.hide();
      });
  }

}
