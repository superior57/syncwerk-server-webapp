import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';

import { AdminService, NotificationService } from 'app/services';

@Component({
  selector: 'app-admin-unshare-group-folder',
  templateUrl: './admin-unshare-group-folder.component.html',
  styleUrls: ['./admin-unshare-group-folder.component.scss']
})
export class AdminUnshareGroupFolderComponent implements OnInit {
  isProcessing = false;
  folderInfo: any = {};

  constructor(
    public bsModalRef: BsModalRef,
    private adminService: AdminService,
    private notify: NotificationService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  unshareFolder() {
    this.isProcessing = true;
    this.adminService.deleteUnshareGroupFolder(this.folderInfo.group_id, this.folderInfo.repo_id).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.UNSHARE_FOLDER_SUCCESSFULLY'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }



}
