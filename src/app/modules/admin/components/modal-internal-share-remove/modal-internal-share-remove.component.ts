import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, ShareAdminService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-internal-share-remove',
  templateUrl: './modal-internal-share-remove.component.html',
  styleUrls: ['./modal-internal-share-remove.component.scss']
})
export class ModalInternalShareRemoveComponent implements OnInit {

  selectedShare: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private shareAdminService: ShareAdminService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    console.log('selected share', this.selectedShare);
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  removeShare() {
    this.isProcessing = true;
    if (this.selectedShare.share_type === 'meeting-private-share') {
      if (this.selectedShare.room_share_type==='SHARED_TO_USER') {
        this.adminService.deleteSharedToUserEntry(this.selectedShare.meeting_room_id, this.selectedShare.share_entry_id).subscribe(resp => {
          this.notify.showNotification('success', this.translate.instant('ADMIN.PUBLIC_SHARES.MESSAGES.REMOVE_SHARE_SUCCESSFULLY'));
          this.bsModalRef.hide();
        });
      } else {
        this.adminService.deleteSharedToGroupEntry(this.selectedShare.meeting_room_id, this.selectedShare.share_entry_id).subscribe(resp => {
          this.notify.showNotification('success', this.translate.instant('ADMIN.PUBLIC_SHARES.MESSAGES.REMOVE_SHARE_SUCCESSFULLY'));
          this.bsModalRef.hide();
        });
      }
    } else {
      this.shareAdminService.deleteDirSharedItems(
        this.selectedShare.repo_id,
        this.selectedShare.path ? this.selectedShare.path : '/',
        this.selectedShare.share_type === 'group' ? this.selectedShare.group_id : this.selectedShare.user_email,
        this.selectedShare.share_type,
      ).subscribe(resp => {
        this.notify.showNotification('success', this.translate.instant('ADMIN.PUBLIC_SHARES.MESSAGES.REMOVE_SHARE_SUCCESSFULLY'));
        this.bsModalRef.hide();
      });
    }
  }
}
