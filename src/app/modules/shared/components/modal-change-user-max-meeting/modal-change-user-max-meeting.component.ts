import { Component, OnInit } from '@angular/core';
import { AdminService, NotificationService } from 'app/services';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-change-user-max-meeting',
  templateUrl: './modal-change-user-max-meeting.component.html',
  styleUrls: ['./modal-change-user-max-meeting.component.scss']
})
export class ModalChangeUserMaxMeetingComponent implements OnInit {

  selectedUser:any = {}
  maxNumberOfMeetings = 0;

  isProcessing = false;

  constructor(
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
    private notify: NotificationService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.maxNumberOfMeetings = this.selectedUser.max_meetings || 0;
  }

  updateUserMaxMeetingSetting() {
    if (this.maxNumberOfMeetings < 0) {
      this.notify.showNotification('success', this.translate.instant('ADMIN.LIST_INSTITUTION_USERS.MESSAGES.NUMBER_OF_MEETINGS_INVALID'));
      return false;
    }
    this.isProcessing = true;
    this.adminService.putCreateUpdateAccount(this.selectedUser.email, { max_meetings: this.maxNumberOfMeetings }).subscribe(
      resps => {
        this.notify.showNotification('success', this.translate.instant('ADMIN.LIST_INSTITUTION_USERS.MESSAGES.UPDATE_NUMBER_OF_MEETINGS_SUCCESS'));
        this.bsModalRef.hide();
      }, error => {
        this.isProcessing = false;
        this.notify.showNotification('success', this.translate.instant('ADMIN.LIST_INSTITUTION_USERS.MESSAGES.UPDATE_NUMBER_OF_MEETINGS_FAILED'));
      });
  }

}
