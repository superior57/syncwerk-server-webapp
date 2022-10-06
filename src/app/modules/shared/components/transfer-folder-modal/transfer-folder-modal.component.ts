
import { map } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

import { FoldersModel } from 'app/Models/Folder.model';
import { Action, Type } from '@enum/index.enum';
import { FilesService, NonAuthenticationService, MessageService, AuthenticationService, AdminService, NotificationService } from '@services/index';

declare var jQuery: any;

@Component({
  selector: 'app-transfer-folder-modal',
  templateUrl: './transfer-folder-modal.component.html',
  styleUrls: ['./transfer-folder-modal.component.scss']
})
export class TransferFolderModalComponent implements OnInit {

  @Input() type: string;
  @Input() dataTransfer: any;
  @Input() itemName: string;
  @Output() transfered: EventEmitter<any> = new EventEmitter<any>();

  dataUserTransfer: any = '';
  errorMessage: string;
  userListForShare = [];
  isProcessing = false;
  params: any;
  ENABLE_GLOBAL_ADDRESSBOOK = false;

  constructor(
    private authService: AuthenticationService,
    private filesService: FilesService,
    private adminService: AdminService,
    private messageService: MessageService,
    private notify: NotificationService,
    private nonAuthenticationService: NonAuthenticationService,
  ) { }

  ngOnInit() {
    this.nonAuthenticationService.getRestapiSettingsByKeys('ENABLE_GLOBAL_ADDRESSBOOK').subscribe((resp) => {
      if (resp.data.config_dict.ENABLE_GLOBAL_ADDRESSBOOK) {
        this.authService.userInfo().subscribe(resp1 => {
          if (resp1.data.permissions.can_use_global_address_book === false) {
            this.ENABLE_GLOBAL_ADDRESSBOOK = false;
          } else {
            this.ENABLE_GLOBAL_ADDRESSBOOK = true;
          }
        });
      } else {
        this.ENABLE_GLOBAL_ADDRESSBOOK = false;
      }
    });
  }

  checkValidation() {
    if (this.userListForShare.length <= 0) {
      this.errorMessage = 'MODALS.TRANSFER.SELECT_USER';
      return false;
    }
    this.dataUserTransfer = this.userListForShare[0].value;
    if (!this.dataUserTransfer) {
      this.errorMessage = 'MODALS.TRANSFER.INVALID_USER';
      return false;
    } else if (this.dataTransfer) {
      if (this.dataUserTransfer === this.dataTransfer.owner) {
        this.errorMessage = 'MODALS.TRANSFER.CANNOT_TRANSFER';
        return false;
      }
    }
    return true;
  }

  submitTransfer() {
    this.isProcessing = true;
    if (this.type === 'folders') {
      this.transferFolder();
    } else if (this.type === 'sys-admin') {
      this.transferSysAdminFoldersAll();
    } else if (this.type === 'default') {
      if (this.checkValidation()) {
        this.transfered.emit(this.dataUserTransfer);
      } else {
        this.isProcessing = false;
      }
    }
  }

  transferFolder() {
    if (this.checkValidation()) {
      this.filesService.transferFolder(this.dataTransfer.id, this.dataUserTransfer)
        .subscribe(resps => {
          this.transfered.emit(resps.message);
        }, error => {
          console.error('transfer folder: ', error);
          this.isProcessing = false;
          this.notify.showNotification('danger', JSON.parse(error._body).message);
        });
    } else {
      this.isProcessing = false;
    }
  }

  transferSysAdminFoldersAll() {
    this.dataUserTransfer = this.userListForShare[0].value;
    if (this.checkValidation()) {
      this.adminService.tranferSysAdminFoldersAll(this.dataTransfer.id, this.dataUserTransfer)
        .subscribe(resps => {
          this.transfered.emit(resps.message);
        }, error => {
          console.error('transfer folder all: ', error);
          this.isProcessing = false;
          this.notify.showNotification('danger', JSON.parse(error._body).message);
        });
    } else {
      this.isProcessing = false;
    }
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.filesService.searchEntries(text, 'user').pipe(map(result => {
      return result.data.users.map(user => {
        const userList = {
          display: user.email,
          value: user.email,
          templateData: user,
        };
        return userList;
      });
    }));


  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }
}
