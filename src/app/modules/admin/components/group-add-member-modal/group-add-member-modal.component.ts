
import {map} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AdminService, NotificationService, AuthenticationService } from '@services/index';

@Component({
  selector: 'app-group-add-member-modal',
  templateUrl: './group-add-member-modal.component.html',
  styleUrls: ['./group-add-member-modal.component.scss']
})
export class GroupAddMemberModalComponent implements OnInit {

  groupInfo: any = {};
  membersToAdd = [];
  ENABLE_GLOBAL_ADDRESSBOOK = false;

  constructor(
    private adminService: AdminService,
    private noti: NotificationService,
    private translate: TranslateService,
    private bsModal: BsModalRef,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.adminService.getRestapiSettingsByKeys('ENABLE_GLOBAL_ADDRESSBOOK').subscribe((resp) => {
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

  handleNameUserList(nameStr: string, email: string, limitStr: number = 35) {
    console.log({ nameStr, email });
    let name;
    if (nameStr !== '') {
      name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    } else {
      const tmpName = email.split('@')[0];
      name = tmpName.length > limitStr ? tmpName.slice(0, limitStr) + '...' : tmpName;
    }
    return name;
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.adminService.getSearchUser(text).pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: this.handleNameUserList(user.name, user.email),
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  addMember() {
    console.log(this.membersToAdd);
    if (this.membersToAdd.length <= 0) {
      this.noti.showNotification('danger', this.translate.instant('ADMIN.GROUPS.MESSAGES.ADD_GROUP_MEMBER_AT_LEAST_A_USER'));
    }
    const emails = [];
    for (const member of this.membersToAdd) {
      emails.push(member.value);
    }
    this.adminService.postAddGroupMembers(this.groupInfo.groupId, emails).subscribe(resp => {
      const numberOfSuccessful = resp.data.success.length;
      const numberOfFailed = resp.data.failed.length;
      if (numberOfSuccessful <= 0) {
        this.noti.showNotification('danger', this.translate.instant('ADMIN.GROUPS.MESSAGES.ADD_GROUP_MEMBER_FAILED', { numberOfFailed }));
      } else {
        if (numberOfFailed <= 0) {
          this.noti.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.ADD_GROUP_MEMBER_SUCCESS', { numberOfSuccessful }));
        } else {
          this.noti.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.ADD_GROUP_MEMBER_PARTLY_SUCCESS', { numberOfSuccessful, numberOfFailed }));
        }
      }
      this.bsModal.hide();
    });
  }

}
