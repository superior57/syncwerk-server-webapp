import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';

import { AdminService, NotificationService } from 'app/services';

@Component({
  selector: 'app-group-remove-member-modal',
  templateUrl: './group-remove-member-modal.component.html',
  styleUrls: ['./group-remove-member-modal.component.scss']
})
export class GroupRemoveMemberModalComponent implements OnInit {

  memberInfo: any = {};
  isProcessing = false;

  constructor(
    private bsModalRef: BsModalRef,
    private adminService: AdminService,
    private notify: NotificationService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  removeGroupMember() {
    this.isProcessing = true;
    this.adminService.deleteRemoveGroupMember(this.memberInfo.group_id, this.memberInfo.email).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.REMOVE_GROUP_MEMBER_SUCCESSFULLY'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }


}
