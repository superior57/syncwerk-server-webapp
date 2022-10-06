import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AdminService, NotificationService } from 'app/services';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-set-quota-modal',
  templateUrl: './set-quota-modal.component.html',
  styleUrls: ['./set-quota-modal.component.scss']
})
export class SetQuotaModalComponent implements OnInit {

  @Input() userList: string[] = [];
  @Output() onSetQuotaSuccess = new EventEmitter();
  @Output() onBatchSetQuotaSuccess = new EventEmitter();

  quotaInMB = '';

  constructor(
    private adminService: AdminService,
    private noti: NotificationService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
  }

  setQuota() {
    if (this.userList.length === 1) {
      this.adminService.putUpdateUserQuota(this.userList[0], this.quotaInMB).subscribe(resp => {
        this.noti.showNotification('success', this.translateService.instant('ADMIN.USERS.SET_QUOTA_SUCCESS'));
        this.onSetQuotaSuccess.emit(resp.data);
      }, errorUserQuota => {
        this.noti.showNotification('danger', this.translateService.instant('ADMIN.USERS.SET_QUOTA_ERROR'));
      });
    } else {
      this.adminService.postBatchUserProcessing(this.userList, 'set-quota', this.quotaInMB).subscribe(resp => {
        this.noti.showNotification('success', this.translateService.instant('ADMIN.USERS.SET_QUOTA_SUCCESS'));
        this.onBatchSetQuotaSuccess.emit(resp.data);
      }, errorUserQuota => {
        this.noti.showNotification('danger', this.translateService.instant('ADMIN.USERS.SET_QUOTA_ERROR'));
      });
    }
  }

}
