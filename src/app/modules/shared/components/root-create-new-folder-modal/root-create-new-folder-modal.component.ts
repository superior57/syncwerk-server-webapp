

import { Component, EventEmitter, OnInit, Output, Input, Renderer, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Select2OptionData } from 'ng2-select2';
import { CookieService } from 'ngx-cookie';
import { Subject } from 'rxjs';

import { AppConfig } from 'app/app.config';
import { FilesService, GroupsService, NotificationService, NonAuthenticationService } from '@services/index';
import { getTypeRepoFromRoute } from 'app/app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-root-create-new-folder-modal',
  templateUrl: './root-create-new-folder-modal.component.html',
  styleUrls: ['./root-create-new-folder-modal.component.scss']
})
export class RootCreateNewFolderModalComponent implements OnInit {

  @Output() create: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('name') inputNameElementRef: ElementRef;
  @ViewChild('password') inputPasswordElementRef: ElementRef;
  @ViewChild('repeat') inputRepeatElementRef: ElementRef;

  public permissionData: Array<any>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  model;
  autoFocus = new Subject<boolean>();
  libNameRegex = /^[^~#%*/\\:<>?|"]*$/;
  nameErrorMessage = '';
  passErrorMessage = '';
  repeatErrorMessage = '';
  permission = 'rw';
  type = '';
  isProcessing = false;
  modalConfig: any = {
    ENABLE_ENCRYPTED_FOLDER: false
  };
  params: any;

  constructor(
    private appConfig: AppConfig,
    private filesService: FilesService,
    private groupsService: GroupsService,
    private nonAuthService: NonAuthenticationService,
    private cookieService: CookieService,
    private _renderer: Renderer,
    private noti: NotificationService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.initData();
    this.getModalSetting();
    setTimeout(() => this.inputNameElementRef.nativeElement.focus(), 600);
    this.type = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
  }

  initData() {
    this.model = {
      name: '',
      encrypted: false,
      password: '',
      repeat: '',
      description: '',
    };
    this.permissionData = [
      {
        id: 'rw',
        text: 'Read-Write'
      },
      {
        id: 'r',
        text: 'Read-Only'
      }
    ];
  }

  getModalSetting() {
    this.nonAuthService.getRestapiSettingsByKeys('ENABLE_ENCRYPTED_FOLDER').subscribe(resp => {
      this.modalConfig = resp.data.config_dict;
    });
  }

  changedSettingPermission(data: { value: string }) {
    this.permission = data.value;
  }

  createFolder() {
    if (this.validateModalForm()) {
      if (this.type) {
        this.isProcessing = true;
        if (this.type.includes('group')) {
          this.groupCreate();
        } else if (this.type === 'org') {
          this.orgCreate();
        } else {
          this.myfileCreate();
        }
      }
    } else {
      this.validateAutoFocus();
    }
  }

  handleInfoCreate() {
    const info: { [key: string]: any } = {
      'name': this.model.name.trim(),
      'desc': this.model.description,
      'passwd': this.model.encrypted ? this.model.password : '',
    };
    if (this.type.includes('group') || this.type === 'org') {
      info.permission = this.permission;
    }
    return info;
  }

  groupCreate() {
    const info = this.handleInfoCreate();
    this.groupsService.createNewGroupFolder(info, this.type.split('--')[1]).subscribe(resp => {
      this.create.emit();
      this.noti.showNotification('success', resp.message);
      this.closeModal();
    }, error => this.noti.showNotification('danger', error.statusText));
  }

  myfileCreate() {
    const info = this.handleInfoCreate();
    this.filesService.createNewFolder(info).subscribe(resp => {
      this.create.emit();
      this.noti.showNotification('success', resp.message);
      this.closeModal();
    }, error => console.error(error));
  }

  orgCreate() {
    const info = this.handleInfoCreate();
    this.filesService.createNewFolderOrg(info).subscribe(resps => {
      this.create.emit();
      this.noti.showNotification('success', resps.message);
      this.closeModal();
    }, error => console.error(error));
  }

  closeModal() {
    jQuery('#modal-create-folder').modal('hide');
  }

  // Handle data
  validateModalForm() {
    this.resetValidate();
    if (this.model.name.trim().length <= 0) {
      this.nameErrorMessage = 'MODALS.TITLES.FOLDER_REQUIRED';
      return false;
    } else if (this.model.name.length > 255) {
      this.nameErrorMessage = 'MODALS.TITLES.MAX_NAME_FOLDER';
      return false;
    } else if (!this.libNameRegex.test(this.model.name)) {
      this.nameErrorMessage = 'MODALS.TITLES.INVALID_FOLDER';
      return false;
    }
    if (this.model.encrypted) {
      if (this.model.password.length <= 0) {
        this.passErrorMessage = 'FORMS.REQUIRED.PASSWORD';
        return false;
      }
      if (this.model.password.length < 8) {
        this.passErrorMessage = 'FORMS.REQUIRED.PASSWORD_LENGTH';
        return false;
      }
      if (this.model.repeat.length <= 0) {
        this.repeatErrorMessage = 'FORMS.REQUIRED.REPEAT_PASSWORD';
        return false;
      }
      if (this.model.password !== this.model.repeat) {
        this.repeatErrorMessage = 'FORMS.REQUIRED.REPEAT_PASSWORD_DOES_NOT_MATCH';
        return false;
      }
    }
    return true;
  }

  resetValidate() {
    this.nameErrorMessage = '';
    this.passErrorMessage = '';
    this.repeatErrorMessage = '';
  }

  validateAutoFocus() {
    if (this.nameErrorMessage !== '') {
      this.inputNameElementRef.nativeElement.focus();
    } else if (this.passErrorMessage !== '') {
      this.inputPasswordElementRef.nativeElement.focus();
    } else if (this.repeatErrorMessage !== '') {
      this.inputRepeatElementRef.nativeElement.focus();
    }
  }

  keyPressName(event) {
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !this.libNameRegex.test(inputChar)) {
      event.preventDefault();
    }
    this.nameErrorMessage = '';
  }

  handleFocus(encrypted: boolean) {
    this.model.encrypted = !this.model.encrypted;
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.model.encrypted
            ? this.model.name === ''
              ? this.inputNameElementRef.nativeElement.focus()
              : this.inputPasswordElementRef.nativeElement.focus()
            : this.inputNameElementRef.nativeElement.focus();
        }, 0);
      } catch (e) {
        reject(e);
      }
    });
  }

  hasPermission() {
    return this.type && (this.type.includes('group') || this.type === 'org');
  }
}
