
import { map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { GroupsService, NonAuthenticationService, OtherService, AuthenticationService, NotificationService } from 'app/services';

import Papa from 'papaparse';

@Component({
  selector: 'app-add-members-modal',
  templateUrl: './add-members-modal.component.html',
  styleUrls: ['./add-members-modal.component.scss']
})
export class AddMembersModalComponent implements OnInit {

  groupInfo: any;
  memberListToAdd: Array<any> = [];
  ENABLE_GLOBAL_ADDRESSBOOK = false;

  selectedFile = null;
  isProcessing = false;

  constructor(
    private groupsService: GroupsService,
    private translate: TranslateService,
    private notify: NotificationService,
    public bsModalRef: BsModalRef,
    private nonAuthenticationService: NonAuthenticationService,
    private authService: AuthenticationService,
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

  onFileChange(data) {
    const selectedFileArr = data.target.files;
    if (selectedFileArr.length <= 0) {
      this.selectedFile = null;
      return;
    }
    const selectedFile = selectedFileArr[0];
    if (selectedFile.type !== 'text/csv' && selectedFile.type !== 'application/vnd.ms-excel') {
      this.clearFileInput();
      this.notify.showNotification('danger', this.translate.instant('NOTIFICATION_MESSAGE.ONLY_CSV_FILES_ALLOWED'));
      return;
    }
    this.selectedFile = selectedFile;
  }

  handleNameUserList(nameStr: string, limitStr: number = 35) {
    const name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    return name;
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.groupsService.searchUserForGroupManagement(this.groupInfo.id, text).pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: this.handleNameUserList(user.name),
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  addGroupMembers() {
    this.isProcessing = true;
    if (this.memberListToAdd.length <= 0) {
      this.notify.showNotification('danger', this.translate.instant('GROUP_MANAGEMENT.YOU_MUST_SELECT_AT_LEAST_1_USER_TO_ADD_TO_THE_GROUP'));
      this.isProcessing = false;
      return;
    }
    const emailListToAdd = [];
    for (const entry of this.memberListToAdd) {
      emailListToAdd.push(entry.value);
    }
    this.groupsService.addMemberToGroupBulk(this.groupInfo.id, emailListToAdd).subscribe(resp => {
      console.log(`res`, resp);
      if (resp.data.failed.length <= 0 && resp.data.success.length <= 0) {
        this.notify.showNotification('danger', resp.message);
      } else if (resp.data.failed.length > 0 && resp.data.success.length <= 0) {
        this.notify.showNotification('danger', this.translate.instant('GROUP_MANAGEMENT.ADD_MEMBERS_MODAL.IMPORT_MEMBER_ERROR'));
      } else {
        this.notify.showNotification('success', resp.message);
      }
      this.memberListToAdd = [];
      this.bsModalRef.hide();
      this.isProcessing = false;
    }, err => {
      this.isProcessing = false;
      this.notify.showNotification('danger', this.translate.instant('GROUP_MANAGEMENT.ADD_MEMBERS_MODAL.SERVER_ERROR'));
    });
  }

  clearFileInput() {
    jQuery('#csv-file-selector').val('');
  }

  async importGroupMembers() {
    this.isProcessing = true;
    if (this.selectedFile === null) {
      this.notify.showNotification('danger', this.translate.instant('GROUP_MANAGEMENT.ADD_MEMBERS_MODAL.INCORRECT_CSV_FILE_ERROR'));
      this.isProcessing = false;
      return;
    }
    const csvString = await this.readCSVStringFromFile(this.selectedFile);
    const csvData = Papa.parse(csvString);
    const emails = [].concat(...csvData.data);
    // const emails = [];
    this.groupsService.addMemberToGroupBulk(this.groupInfo.id, emails).subscribe(resp => {
      const numberOfSuccessful = resp.data.success.length;
      const numberOfFailed = resp.data.failed.length;
      if (numberOfSuccessful <= 0) {
        this.notify.showNotification('danger', this.translate.instant('ADMIN.GROUPS.MESSAGES.ADD_GROUP_MEMBER_FAILED', { numberOfFailed }));
      } else {
        if (numberOfFailed <= 0) {
          this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.ADD_GROUP_MEMBER_SUCCESS', { numberOfSuccessful }));
        } else {
          this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.ADD_GROUP_MEMBER_PARTLY_SUCCESS', { numberOfSuccessful, numberOfFailed }));
        }
      }
      this.memberListToAdd = [];
      this.bsModalRef.hide();
      this.isProcessing = false;
    }, err => {
      this.notify.showNotification('danger', this.translate.instant('GROUP_MANAGEMENT.ADD_MEMBERS_MODAL.SERVER_ERROR'));
    });
  }

  readCSVStringFromFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const fileForRead: File = file;
        const reader: FileReader = new FileReader();
        reader.readAsText(fileForRead);
        reader.onload = (e) => {
          try {
            const csvStr = reader.result;
            resolve(csvStr);
          } catch (error) {
            reject(null);
          }
        };
      } catch (e) {
        reject(null);
      }
    });
  }

}
