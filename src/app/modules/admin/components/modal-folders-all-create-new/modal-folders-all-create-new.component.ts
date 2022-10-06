
import {map} from 'rxjs/operators';
import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminService, NotificationService, FilesService } from 'app/services';

@Component({
  selector: 'app-modal-folders-all-create-new',
  templateUrl: './modal-folders-all-create-new.component.html',
  styleUrls: ['./modal-folders-all-create-new.component.scss']
})

export class ModalFoldersAllCreateNewComponent implements OnInit {

  @ViewChild('name') inputName: ElementRef;
  @ViewChild('owner') inputOwner: ElementRef;
  @ViewChild('password') inputPasswordEncrypt: ElementRef;
  @ViewChild('repeat') inputRepeatEncrypt: ElementRef;
  @Output() created = new EventEmitter;

  model = {
    name: '',
    owner: [],
    encrypted: false,
    password: '',
    repeat: ''
  };
  libNameRegex = /^[^~#%*/\\:<>?|".]*$/;
  nameErrorMessage = '';
  validateErr = {
    type: '',
    message: ''
  };
  isProcessing = false;
  params: any;

  constructor(
    private adminService: AdminService,
    private filesService: FilesService,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
    setTimeout(() => this.inputName.nativeElement.focus(), 600);
  }

  createFolder() {
    if (this.validationForm()) {
      this.isProcessing = true;
      const owner = this.model.owner.length > 0 ? this.model.owner[0].value : '';
      const passwd = this.model.encrypted ? this.model.password : '';
      const dataCreate = this.handleDataCreateFolder();
      this.adminService.createFolderInFoldersAll(dataCreate)
        .subscribe(resps => {
          this.created.emit(resps.message);
        }, error => {
          this.isProcessing = false;
          this.notification.showNotification('danger', JSON.parse(error._body).message);
          console.error(error);
        });
    }
  }

  handleDataCreateFolder() {
    const data = {
      'name': this.model.name,
      'owner': this.model.owner.length > 0 ? this.model.owner[0].value : '',
      'passwd': this.model.encrypted ? this.model.password : ''
    };
    return data;
  }

  validationForm() {
    this.nameErrorMessage = '';
    this.validateErr = { type: '', message: '' };
    if (this.model.name.trim().length <= 0) {
      this.inputName.nativeElement.focus();
      this.validateErr = {
        type: 'name',
        message: 'VALIDATORS.FOLDER_NAME_REQUIRED'
      };
      return false;
    } else if (this.model.name.length > 255) {
      this.inputName.nativeElement.focus();
      this.validateErr = {
        type: 'name',
        message: 'VALIDATORS.FOLDER_NAME_MAX_LENGTH'
      };
      return false;
    } else if (!this.libNameRegex.test(this.model.name)) {
      this.inputName.nativeElement.focus();
      this.validateErr = {
        type: 'name',
        message: 'VALIDATORS.FOLDER_NAME_INVALID'
      };
      return false;
    } else if (this.model.password.length <= 0) {
      if (this.model.encrypted) {
        this.inputPasswordEncrypt.nativeElement.focus();
        this.validateErr = {
          type: 'password',
          message: 'VALIDATORS.PASSWORD_REQUIRED'
        };
        return false;
      }
    } else if (this.model.password !== this.model.repeat) {
      if (this.model.encrypted) {
        this.inputRepeatEncrypt.nativeElement.focus();
        this.validateErr = {
          type: 'password-repeat',
          message: 'VALIDATORS.PASSWORD_REPEAT_NOT_MATCH'
        };
        return false;
      }
    }
    return true;
  }

  focusError() {
    if (this.nameErrorMessage !== '') {
      this.inputName.nativeElement.focus();
    }
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.filesService.searchEntries(text, 'user').pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: user.name,
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  handleFocusEncrypted() {
    this.model.encrypted = !this.model.encrypted;
    if (this.model.encrypted) {
      setTimeout(() => this.inputPasswordEncrypt.nativeElement.focus());
    } else {
      this.inputName.nativeElement.focus();
    }
  }
}
