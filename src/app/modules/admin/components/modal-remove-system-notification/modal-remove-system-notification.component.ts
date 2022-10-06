import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-remove-system-notification',
  templateUrl: './modal-remove-system-notification.component.html',
  styleUrls: ['./modal-remove-system-notification.component.scss']
})
export class ModalRemoveSystemNotificationComponent implements OnInit {

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

  removeSystemNotification() {
    this.isProcessing = true;
    this.adminService.deleteSystemNotification(this.selectedNotification.id).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.NOTIFICATIONS.MESSAGES.REMOVE_NOTIFICATION_SUCCESSFULLY'));
      this.bsModalRef.hide();
    });
  }

  closeModal() {
    this.bsModalRef.hide();
  }

}
