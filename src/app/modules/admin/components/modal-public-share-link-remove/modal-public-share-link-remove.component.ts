import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-public-share-link-remove',
  templateUrl: './modal-public-share-link-remove.component.html',
  styleUrls: ['./modal-public-share-link-remove.component.scss']
})
export class ModalPublicShareLinkRemoveComponent implements OnInit {

  selectedLink: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    // console.log(this.selectedLink);
    if (this.selectedLink.share_type === 'meeting-public-share') {
      this.selectedLink.token = this.selectedLink.share_token;
      this.selectedLink.type = this.selectedLink.share_type;
    }
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  removeLink() {
    if (this.selectedLink.share_type === 'meeting-public-share') {
      this.adminService.deleteRemoveMeetingRoomPublicLink(this.selectedLink.meeting_room_id).subscribe(resp => {
        this.notify.showNotification('success', this.translate.instant('ADMIN.PUBLIC_SHARES.MESSAGES.REMOVE_LINK_SUCCESSFULLY'));
        this.bsModalRef.hide();
      });
    } else if (this.selectedLink.type === 'upload') {
      this.adminService.deleteUploadLink(this.selectedLink.token).subscribe(resp => {
        this.notify.showNotification('success', this.translate.instant('ADMIN.PUBLIC_SHARES.MESSAGES.REMOVE_LINK_SUCCESSFULLY'));
        this.bsModalRef.hide();
      });
    } else {
      this.adminService.deleteDownloadLink(this.selectedLink.token).subscribe(resp => {
        this.notify.showNotification('success', this.translate.instant('ADMIN.PUBLIC_SHARES.MESSAGES.REMOVE_LINK_SUCCESSFULLY'));
        this.bsModalRef.hide();
      });
    }
  }

}
