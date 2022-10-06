import { Component, OnInit, Input, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';

import { FoldersModel } from 'app/Models/Folder.model';
import { FilesService, NotificationService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-root-change-password-folder-modal',
  templateUrl: './root-change-password-folder-modal.component.html',
  styleUrls: ['./root-change-password-folder-modal.component.scss']
})
export class RootChangePasswordFolderModalComponent implements OnInit, AfterViewInit {

  @ViewChild('oldPassword') inputOldPassElement;
  @ViewChild('newPassword') inputNewPassElement;
  @ViewChild('repeatPassword') inputRepeatPassElement;

  @Input() Folder: FoldersModel;

  model;
  oldPassMsg;
  newPassMsg;
  repeatPassMsg;
  params: any;

  constructor(
    private filesService: FilesService,
    private noti: NotificationService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.initData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.inputOldPassElement.nativeElement.focus(), 500);
  }

  initData() {
    this.model = {
      oldPassword: '',
      newPassword: '',
      repeatPassword: ''
    };
    this.resetValidate();
  }

  resetValidate() {
    this.oldPassMsg = '';
    this.newPassMsg = '';
    this.repeatPassMsg = '';
  }

  changePassword() {
    if (!this.validate()) {
      this.handleFocus();
      return;
    }
    this.filesService.changePasswordFolder(this.Folder.id, this.model.oldPassword, this.model.newPassword)
      .subscribe(resp => {
        this.translate.get('NOTIFICATION_MESSAGE.CHANGE_PASSWORD_FOLDER.SUCCESSFULLY').subscribe((res: string) => {
          this.noti.showNotification('success', res);
          this.closeModal();
        });
      }, error => {
        console.error(error);
        const errCode = JSON.parse(error._body).error_code;
        if (errCode === 'incorrect_password') {
          this.translate.get('NOTIFICATION_MESSAGE.CHANGE_PASSWORD_FOLDER.WRONG_OLD_PASSWORD').subscribe((res: string) => {
            this.oldPassMsg = res;
            this.inputOldPassElement.nativeElement.focus();
          });
        }
      });
  }

  closeModal() {
    jQuery('#change-password-folder-modal').modal('hide');
  }

  validate() {
    this.resetValidate();
    if (this.model.oldPassword.length <= 0) {
      this.translate.get('FORMS.VALIDATES.OLD_PASSWORD_REQUIRED').subscribe((res: string) => {
        this.oldPassMsg = res;
      });
      return false;
    }
    if (this.model.newPassword.length <= 0) {
      this.translate.get('FORMS.VALIDATES.NEW_PASSWORD_REQUIRED').subscribe((res: string) => {
        this.newPassMsg = res;
      });
      return false;
    }
    if (this.model.newPassword.length < 8) {
      this.translate.get('FORMS.VALIDATES.NEW_PASSWORD_LEAST_CHARACTERS').subscribe((res: string) => {
        this.newPassMsg = res;
      });
      return false;
    }
    if (this.model.newPassword === this.model.oldPassword) {
      this.translate.get('FORMS.VALIDATES.DIFFERENT_PASSWORD').subscribe((res: string) => {
        this.newPassMsg = res;
      });
      return false;
    }
    if (this.model.repeatPassword.length <= 0) {
      this.translate.get('FORMS.VALIDATES.REPEAT_PASSWORD_REQUIRED').subscribe((res: string) => {
        this.repeatPassMsg = res;
      });
      return false;
    }
    if (this.model.repeatPassword !== this.model.newPassword) {
      this.translate.get('FORMS.VALIDATES.REPEAT_PASSWORD_DOES_NOT_MATCH').subscribe((res: string) => {
        this.repeatPassMsg = res;
      });
      return false;
    }
    return true;
  }

  handleFocus() {
    if (this.oldPassMsg) {
      this.inputOldPassElement.nativeElement.focus();
    } else if (this.newPassMsg) {
      this.inputNewPassElement.nativeElement.focus();
    } else if (this.repeatPassMsg) {
      this.inputRepeatPassElement.nativeElement.focus();
    }
  }
}
