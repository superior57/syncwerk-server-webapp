import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-remove-tenant',
  templateUrl: './modal-remove-tenant.component.html',
  styleUrls: ['./modal-remove-tenant.component.scss']
})
export class ModalRemoveTenantComponent implements OnInit {

  selectedTenant: any = {};
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

  removeTenant() {
    this.isProcessing = true;
    this.adminService.deleteTenant(this.selectedTenant.id).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.REMOVE_INSTITUTION_SUCCESS'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
