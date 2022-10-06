import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-group-rename',
  templateUrl: './modal-group-rename.component.html',
  styleUrls: ['./modal-group-rename.component.scss']
})
export class ModalGroupRenameComponent implements OnInit {

  isProcessing = false;
  selectedGroup: any = {};
  newGroupName = '';
  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    this.newGroupName = this.selectedGroup.name;
  }

  renameGroup() {
    if (!this.newGroupName) {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.GROUPS.MESSAGES.RENAME_GROUP_INVALID_NAME'));
      return false;
    }
    this.isProcessing = true;
    this.adminService.putRenameGroup(this.selectedGroup.id, this.newGroupName).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.RENAME_GROUP_SUCCESS'));
      this.bsModalRef.hide();
    }, error => {
      this.notify.showNotification('danger', JSON.parse(error._body).message);
      this.bsModalRef.hide();
    });
  }

}
