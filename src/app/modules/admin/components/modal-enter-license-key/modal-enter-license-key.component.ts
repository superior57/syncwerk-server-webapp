import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {AdminService} from '@services/admin.service';
import {NotificationService} from '@services/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-enter-license-key',
  templateUrl: './modal-enter-license-key.component.html',
  styleUrls: ['./modal-enter-license-key.component.scss']
})
export class ModalEnterLicenseKeyComponent implements OnInit {
  licenseKey = '';
  isProcessing = false;
  errorText = ''

  constructor(
      public bsModalRef: BsModalRef,
      private adminService: AdminService,
          private notify: NotificationService,
    private translateService: TranslateService

  ) {
  }

  ngOnInit() {
  }
  submitLicense(){
    console.log(this.licenseKey);
    this.adminService.postLicense(null, this.licenseKey).subscribe(resps => {
      this.notify.showNotification('success', this.translateService.instant('ADMIN.INFO.UPLOAD_LICENSE_SUCCESS'));
      this.licenseKey = '';
      this.bsModalRef.hide();
    }, err => {
      const status = err.status;
      switch (status) {
        case 401:
          this.notify.showNotification('danger', JSON.parse(err._body).detail);
          this.errorText = JSON.parse(err._body).detail;
          break;
        case 400:
          console.log(err);
          this.notify.showNotification('danger', JSON.parse(err._body).message);
          this.errorText = JSON.parse(err._body).message;
          break;
        default:
          this.notify.showNotification('danger', this.translateService.instant('ADMIN.INFO.UPLOAD_LICENSE_ERROR'));
          this.errorText = this.translateService.instant('ADMIN.INFO.UPLOAD_LICENSE_ERROR');
      }
    });

  }
}
