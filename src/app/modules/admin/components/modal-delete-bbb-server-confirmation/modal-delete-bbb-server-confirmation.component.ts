import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-delete-bbb-server-confirmation',
  templateUrl: './modal-delete-bbb-server-confirmation.component.html',
  styleUrls: ['./modal-delete-bbb-server-confirmation.component.scss']
})
export class ModalDeleteBbbServerConfirmationComponent implements OnInit {

  selectedBBBServer: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  deleteBBBServer() {
    this.isProcessing = true;
    this.adminService.deleteBBBServer(this.selectedBBBServer.id).subscribe(resp => {
       this.notify.showNotificationByMessageKey('success', resp.message);
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

  closeModal() {
    this.bsModalRef.hide();
  }
}
