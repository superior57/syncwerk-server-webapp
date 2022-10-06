import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';


@Component({
  selector: 'app-modal-confirm-remove-email-change-request',
  templateUrl: './modal-confirm-remove-email-change-request.component.html',
  styleUrls: ['./modal-confirm-remove-email-change-request.component.scss']
})
export class ModalConfirmRemoveEmailChangeRequestComponent implements OnInit {

  selectedRequest: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    console.log(this.selectedRequest);
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  removeRequest() {
    this.isProcessing = true;
    this.adminService.deleteRemoveEmailChangeRequest(this.selectedRequest.id).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.EMAIL_CHANGES.MESSAGES.REMOVE_REQUEST_SUCCESS'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
