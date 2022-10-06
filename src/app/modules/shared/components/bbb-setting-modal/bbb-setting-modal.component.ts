import { Component, OnInit, Input, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { GroupsService, AdminService, NotificationService, MeetingsService } from 'app/services';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
@Component({
  selector: 'app-bbb-setting-modal',
  templateUrl: './bbb-setting-modal.component.html',
  styleUrls: ['./bbb-setting-modal.component.scss']
})


export class BBBSettingModalComponent implements OnInit {
  model = {
    isActive: false,
    bbbServer: '',
    bbbSecret: '',
    id: 0
  };
  groupInfo;
  tenantInfo;
  isTestingBBBConnection = false;
  isAdminMode = false;
  settingMode = 'group' // this can be 'group' or 'tenant'. Default is 'group'


  constructor(
    private groupsService: GroupsService,
    private notification: NotificationService,
    private meetingsService: MeetingsService,
    private bsModalRef: BsModalRef,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    console.log(this.tenantInfo)
    this.getBBBSetting();
  }

  getBBBSetting() {
    if (this.settingMode === 'group') {
      if (this.isAdminMode) {
        this.adminService.getGroupBBBSetting(this.groupInfo.id).subscribe(resp => {
          const data = resp.data;
          this.model.isActive = data.is_active;
          this.model.bbbServer = data.bbb_server;
          this.model.bbbSecret = data.bbb_secret;
          this.model.id = data.id || 0;
        }, err => {
          this.notification.showNotification('danger', 'Server error');
        });
      } else {
        this.groupsService.getBBBSetting(this.groupInfo.id).subscribe(resp => {
          const data = resp.data;
          this.model.isActive = data.is_active;
          this.model.bbbServer = data.bbb_server;
          this.model.bbbSecret = data.bbb_secret;
          this.model.id = data.id || 0;
        }, err => {
          this.notification.showNotification('danger', 'Server error');
        });
      }
    } else {
      this.adminService.getTenantBBBSetting(this.tenantInfo.id).subscribe(resp => {
        const data = resp.data;
        this.model.isActive = data.is_active;
        this.model.bbbServer = data.bbb_server;
        this.model.bbbSecret = data.bbb_secret;
        this.model.id = data.id || 0;
      }, err => {
        this.notification.showNotification('danger', 'Server error');
      });
    }

  }

  updateBBBSetting() {
    const data = {
      bbb_server_url: this.model.bbbServer,
      bbb_server_secret: this.model.bbbSecret,
      bbb_is_active: this.model.isActive
    }
    if (this.settingMode === 'group') {
      if (this.isAdminMode) {
        this.adminService.updateGroupBBBSetting(this.groupInfo.id, data).subscribe(resp => {
          this.notification.showNotification('success', resp.message);
          this.closeModal();
        }, err => {
          this.notification.showNotification('danger', 'Server error');
        });
      } else {
        this.groupsService.updateBBBSetting(this.groupInfo.id, data).subscribe(resp => {
          this.notification.showNotification('success', resp.message);
          this.closeModal();
        }, err => {
          this.notification.showNotification('danger', 'Server error');
        });
      }
    } else {
      this.adminService.updateTenantBBBSetting(this.tenantInfo.id, data).subscribe(resp => {
        this.notification.showNotification('success', resp.message);
        this.closeModal();
      }, err => {
        this.notification.showNotification('danger', 'Server error');
      });
    }
  }

  testBBBConnection() {
    this.isTestingBBBConnection = true;
    this.meetingsService.testPrivateBBBConnection(this.model.bbbServer, this.model.bbbSecret).subscribe(resp => {
      this.notification.showNotification('success', resp.message);
      this.isTestingBBBConnection = false;
    }, err => {
      const status = err.status;
      switch (status) {
        case 401:
          this.notification.showNotification('danger', JSON.parse(err._body).detail);
          break;
        default:
          this.notification.showNotification('danger', JSON.parse(err._body).message);
          break;
      }
      this.isTestingBBBConnection = false;
    }
    );
  }

  closeModal() {
    this.bsModalRef.hide();
  }


}
