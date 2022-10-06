import { Component, OnInit } from '@angular/core';
import { AdminService, NotificationService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';
import {ModalCreateNewMeetingComponent} from '@modules/admin/components/modal-create-new-meeting/modal-create-new-meeting.component';
import {ModalEnterLicenseKeyComponent} from '@modules/admin/components/modal-enter-license-key/modal-enter-license-key.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sys-admin-info',
  templateUrl: './sys-admin-info.page.html',
  styleUrls: ['./sys-admin-info.page.scss']
})
export class SysAdminInfoPageComponent implements OnInit {

  infoData;
  isProcessing = true;
  params: any;
  selectedFile = null;
  availableFeatureStr = '';
  bsModalRef: BsModalRef;

  constructor(
      private modalService: BsModalService,
    private adminService: AdminService,
    private notify: NotificationService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.getInfo();
  }

  getInfo() {
    this.adminService.getSysAdminInfo().subscribe(resps => {
      setTimeout(() => this.isProcessing = false, 300);
      this.infoData = resps.data;
      this.populateAvailableFeatureStr();
    }, error => console.error(error));
  }

  populateAvailableFeatureStr() {
    const availableFeaturesStrArr = [];
    if (this.infoData.license_json.available_features.includes('folders')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_FOLDER'));
    }
    if (this.infoData.license_json.available_features.includes('fileComments')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_FILE_COMMENTS'));
    }
    if (this.infoData.license_json.available_features.includes('groups')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_GROUPS'));
    }
    if (this.infoData.license_json.available_features.includes('wiki')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_WIKI'));
    }
    if (this.infoData.license_json.available_features.includes('filePreview')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_FILE_PREVIEW'));
    }
    if (this.infoData.license_json.available_features.includes('internalShare')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_INTERNAL_SHARE'));
    }
    if (this.infoData.license_json.available_features.includes('publicShare')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_PUBLIC_SHARE'));
    }
    if (this.infoData.license_json.available_features.includes('adminArea')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_ADMIN_AREA'));
    }
    if (this.infoData.license_json.available_features.includes('multiTenancy')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_MULTI_TENANCY'));
    }
    if (this.infoData.license_json.available_features.includes('webdav')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_WEBDAV'));
    }
    if (this.infoData.license_json.available_features.includes('trafficTracking')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_ADMIN_TRAFFIC'));
    }
    if (this.infoData.license_json.available_features.includes('virusScanning')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_VIRUS_SCANNING'));
    }
    if (this.infoData.license_json.available_features.includes('auditLog')) {
      availableFeaturesStrArr.push(this.translateService.instant('ADMIN.INFO.FEATURES_AUDIT_LOG'));
    }

    if (availableFeaturesStrArr.length <= 0) {
      this.availableFeatureStr = '(none)';
    } else {
      this.availableFeatureStr = availableFeaturesStrArr.join(', ');
    }
  }

  onUploadLicense(data) {
    const selectedFileArr = data.target.files;
    if (selectedFileArr.length <= 0) {
      this.selectedFile = null;
      return;
    }
    this.selectedFile = selectedFileArr[0];
    this.uploadLicense();
  }

  uploadLicense() {
    this.adminService.postLicense(this.selectedFile).subscribe(resps => {
      this.notify.showNotification('success', this.translateService.instant('ADMIN.INFO.UPLOAD_LICENSE_SUCCESS'));
      this.getInfo();
    }, err => {
      const status = err.status;
      switch (status) {
        case 401:
          this.notify.showNotification('danger', JSON.parse(err._body).detail);
          break;
        case 400:
          console.log(err);
          this.notify.showNotification('danger', JSON.parse(err._body).message);
          break;
        default:
          this.notify.showNotification('danger', this.translateService.instant('ADMIN.INFO.UPLOAD_LICENSE_ERROR'));
      }
    });
  }
  showEnterLicenseModal() {
        this.bsModalRef = this.modalService.show(ModalEnterLicenseKeyComponent, {
      class: 'modal-lg admin-enter-license-modal',
    });
        this.modalService.onHidden.subscribe((reason: string | any) => {
              this.getInfo();
        });
  }
}
