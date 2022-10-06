import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-tenant-update-quota',
  templateUrl: './modal-tenant-update-quota.component.html',
  styleUrls: ['./modal-tenant-update-quota.component.scss']
})
export class ModalTenantUpdateQuotaComponent implements OnInit {

  selectedTenant: any = {};
  isProcessing = false;
  tenantQuota = 0;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  updateTenantQuota() {
    if (!this.tenantQuota || this.tenantQuota < 0 || this.tenantQuota % 1 !== 0) {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.INSTITUTION_UPDATE_QUOTA_INVALID_QUOTA'));
      return false;
    }
    this.adminService.putUpdateTenantQuota(this.selectedTenant.id, this.tenantQuota).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.INSTITUTION_UPDATE_QUOTA_SUCCESS'));
      this.bsModalRef.hide();
    }, err => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.INSTITUTION_UPDATE_QUOTA_FAILED'));
    });
  }

}
