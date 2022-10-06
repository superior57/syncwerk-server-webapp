import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';
@Component({
  selector: 'app-modal-tenant-remove-members',
  templateUrl: './modal-tenant-remove-members.component.html',
  styleUrls: ['./modal-tenant-remove-members.component.scss']
})
export class ModalTenantRemoveMembersComponent implements OnInit {

  selectedTenantDetails: any = {};
  selectedUser: any = {};

  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  removeMemberFromTenant() {
    this.isProcessing = true;
    this.adminService.deleteTenantUser(this.selectedTenantDetails.id, this.selectedUser.email).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.REMOVE_INSTITUTION_MEMBER_SUCCESS'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
