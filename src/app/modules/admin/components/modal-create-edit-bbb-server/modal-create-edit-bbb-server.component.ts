import { Component, OnInit } from '@angular/core';
import { NotificationService, AdminService, MeetingsService } from 'app/services';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-create-edit-bbb-server',
  templateUrl: './modal-create-edit-bbb-server.component.html',
  styleUrls: ['./modal-create-edit-bbb-server.component.scss']
})
export class ModalCreateEditBbbServerComponent implements OnInit {

  bbb_form = {
    bbbServerName: '',
    bbbServer: '',
    bbbServerSecret: '',
    liveStreamToken: '',
    liveStreamServer: '',
    id: 0,
    serverOwner: '',
  };

  isEditMode = false;
  isTestingBBBConnection = false;

  selectedServerId = 0;

  constructor(
    private notify: NotificationService,
    private translate: TranslateService,
    private adminService: AdminService,
    private bsModalRef: BsModalRef,
    private meetingsService: MeetingsService,
  ) { }

  ngOnInit() {
    if (this.isEditMode) {
      this.adminService.getBBBServerById(this.selectedServerId).subscribe(resp => {
        this.bbb_form.id = resp.data.id;
        this.bbb_form.bbbServerName = resp.data.setting_name;
        this.bbb_form.bbbServer = resp.data.bbb_server;
        this.bbb_form.bbbServerSecret = resp.data.bbb_secret;
        this.bbb_form.serverOwner = resp.data.server_owner;
        this.bbb_form.liveStreamToken = resp.data.live_stream_token;
        this.bbb_form.liveStreamServer = resp.data.live_stream_server;
      })
    }
  }

  validateForm() {
    if (this.bbb_form.bbbServerName.trim() === '') {
      this.notify.showNotification('danger', this.translate.instant('BBB_SERVERS.MESSAGES.SERVER_NAME_REQUIRED'))
      return false;
    }
    if (this.bbb_form.bbbServerName.length > 255) {
      this.notify.showNotification('danger', this.translate.instant('BBB_SERVERS.MESSAGES.SERVER_NAME_LENGTH_INVALID'))
      return false;
    }
    if (this.bbb_form.bbbServer.trim() === '') {
      this.notify.showNotification('danger', this.translate.instant('BBB_SERVERS.MESSAGES.SERVER_URL_REQUIRED'))
      return false;
    }
    if (this.bbb_form.bbbServerSecret === '') {
      this.notify.showNotification('danger', this.translate.instant('BBB_SERVERS.MESSAGES.SERVER_SECRET_REQUIRED'))
      return false;
    }
    return true;
  }

  addBBBServer() {
    const isFormValid = this.validateForm();
    if (!isFormValid) {
      return false;
    }
    // validated. procceed to add the meeting info
    this.adminService.postAddBBBServer(this.bbb_form).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.closeModal();
    }, error => {
      this.notify.showNotification('danger', JSON.parse(error._body).message);
    })
  }

  editBBBServer() {
    const isFormValid = this.validateForm();
    if (!isFormValid) {
      return false;
    }
    // validated. procceed to edit the meeting info
    this.adminService.putEditBBBServer(this.bbb_form.id, this.bbb_form).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.closeModal();
    }, error => {
      this.notify.showNotification('danger', JSON.parse(error._body).message);
    })
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  testBBBConnection() {
    this.isTestingBBBConnection = true;
    this.meetingsService.testPrivateBBBConnection(this.bbb_form.bbbServer, this.bbb_form.bbbServerSecret).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.isTestingBBBConnection = false;
    }, err => {
      const status = err.status;
      switch (status) {
        case 401:
          this.notify.showNotification('danger', JSON.parse(err._body).detail);
          break;
        default:
          this.notify.showNotification('danger', JSON.parse(err._body).message);
          break;
      }
      this.isTestingBBBConnection = false;
    });
  }


  generatePin() {
    const randomPin = this.randomString();
        this.bbb_form.liveStreamToken = randomPin;
  }

  randomString() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }


}
