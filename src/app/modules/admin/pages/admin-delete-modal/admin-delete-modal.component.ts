import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { AdminService, NotificationService } from '@services/index';




@Component({
  selector: 'app-admin-delete-modal',
  templateUrl: './admin-delete-modal.component.html',
  styleUrls: ['./admin-delete-modal.component.scss']
})
export class AdminDeleteModalComponent implements OnInit {

  data;
  path;
  repoID;

  titleOfModal;
  getValueFromData: any;
  isProcessing = false;


  constructor(
    private notiService: NotificationService,
    private BsModalRef: BsModalRef,
    private translate: TranslateService,
    private adminService: AdminService,

  ) { }

  ngOnInit() {
    this.getType();
  }

  getType() {
    this.getValueFromData = this.data.type === 'dir' ? this.translate.instant('TYPE_FILES.FOLDER') : this.translate.instant('TYPE_FILES.FILE');
    this.titleOfModal = this.getValueFromData.value;
  }

  deleteFolder() {
    this.isProcessing = true;
    this.adminService.deleteFileFolderInFoldersSys(this.repoID, this.path).subscribe(resp => {
      this.notiService.showNotification('success', resp.message);
      this.BsModalRef.hide();
    }, error => {
      this.notiService.showNotification('danger', JSON.parse(error._body).message);
      this.BsModalRef.hide();
    });
  }

  closeModal() {
    this.BsModalRef.hide();
  }

}
