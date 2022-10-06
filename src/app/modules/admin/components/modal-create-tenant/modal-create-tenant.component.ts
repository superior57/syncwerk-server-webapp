import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-create-tenant',
  templateUrl: './modal-create-tenant.component.html',
  styleUrls: ['./modal-create-tenant.component.scss']
})
export class ModalCreateTenantComponent implements OnInit {

  tenantName = '';
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  addTenant() {
    if (this.tenantName.trim() === '' || this.tenantName === null || this.tenantName === undefined) {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.INSTITUTION_NAME_REQUIRED'));
      return false;
    }
    this.isProcessing = true;
    this.adminService.postAddNewTenant(this.tenantName).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.ADD_INSTITUTION_SUCCESS'));
      this.bsModalRef.hide();
    }, err => {
      // this.notify.showNotification('danger', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.ADD_INSTITUTION_FAILED'));
      this.notify.showNotification('danger', JSON.parse(err._body).message);
      this.isProcessing = false;
    });
  }

}
