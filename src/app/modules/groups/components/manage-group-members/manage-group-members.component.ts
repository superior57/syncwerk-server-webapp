
import {map} from 'rxjs/operators';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng2-select2';

import { GroupsService, NotificationService, AuthenticationService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-manage-group-members',
  templateUrl: './manage-group-members.component.html',
  styleUrls: ['./manage-group-members.component.scss']
})
export class ManageGroupMembersComponent implements OnInit {

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  @Input() groupInfo: any;

  currentLoginUser: any = null;
  groupMemberList = [];
  memberListToAdd = [];
  editRoleIndex = -1;
  roleAction = {
    allowChangeMemberRole: false,
    allowRemoveAdmin: false,
  };

  constructor(
    private groupService: GroupsService,
    private noti: NotificationService,
    private authService: AuthenticationService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    jQuery('.scrollbar-macosx').scrollbar();
    this.initDataSelect();
    this.getGroupMembers(this.groupInfo.id);
    this.getCurrentLoginUserInfo();
  }

  initDataSelect() {
    this.exampleData = [
      {
        id: 'true',
        text: 'Admin'
      },
      {
        id: 'false',
        text: 'Member'
      }
    ];
  }

  getGroupMembers(groupID) {
    this.groupService.getMembersInGroup(groupID).subscribe(resp => {
      this.groupMemberList = resp.data;
    });
  }

  getCurrentLoginUserInfo() {
    return this.authService.userInfo().subscribe(resp => {
      this.currentLoginUser = resp.data;
    });
  }

  canChangeRole(member) {
    if (this.currentLoginUser.email === member.email) {
      // self
      return false;
    } else if (this.currentLoginUser.email === this.groupInfo.owner.email) {
      // owner
      return true;
    } else if (this.groupInfo.admins.indexOf(this.currentLoginUser.email) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  canRemove(member) {
    if (this.currentLoginUser.email === member.email) {
      // self
      return false;
    } else if (this.currentLoginUser.email === this.groupInfo.owner.email) {
      // owner
      return true;
    } else if (this.groupInfo.admins.indexOf(this.currentLoginUser.email) !== -1 && member.email !== this.groupInfo.owner.email) {
      // admin can only remove another member
      return true;
    } else {
      return false;
    }
  }

  removeMember(member, index) {
    this.groupService.removeGroupMemer(this.groupInfo.id, member.email).subscribe(resp => {
      this.noti.showNotification('success', `${member.name} removed from ${this.groupInfo.name}`);
      if (this.editRoleIndex === index) {
        this.editRoleIndex = -1;
      }
      this.getGroupMembers(this.groupInfo.id);
    }, err => {
      this.noti.showNotification('danger', `Server error`);
    });
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.groupService.searchUserForGroupManagement(this.groupInfo.id, text).pipe(map(result => {
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

  handleNameUserList(nameStr: string, limitStr: number = 35) {
    const name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    return name;
  }

  addMemberToGroup() {
    if (this.memberListToAdd.length <= 0) {
      this.noti.showNotification('danger', this.translate.instant('GROUP_MANAGEMENT.YOU_MUST_SELECT_AT_LEAST_1_USER_TO_ADD_TO_THE_GROUP'));
      return;
    }
    const emailListToAdd = [];
    for (const entry of this.memberListToAdd) {
      emailListToAdd.push(entry.value);
    }
    this.groupService.addMemberToGroupBulk(this.groupInfo.id, emailListToAdd).subscribe(resp => {
      this.noti.showNotification('success', resp.message);
      this.memberListToAdd = [];
      this.getGroupMembers(this.groupInfo.id);
    }, err => {
      this.noti.showNotification('danger', 'Server error.');
    });
  }

  changeGroupMemberRole(member, data: { value: boolean }) {
    this.groupService.changeGroupMemberRole(this.groupInfo.id, member.email, data.value)
      .subscribe(resp => {
        this.getGroupMembers(this.groupInfo.id);
        this.noti.showNotification('success', resp.message);
      }, err => this.noti.showNotification('danger', JSON.parse(err._body).message));
    this.editRoleIndex = -1;
  }

  openUserProfile(email) {
    jQuery('#manage-group-members').modal('hide');
    this.router.navigate(['user', 'profile', email]);
  }

  onFocusOut() {
    setTimeout(() => this.editRoleIndex = -1, 100);
  }

  importMembersSuccess() {
    this.getGroupMembers(this.groupInfo.id);
  }
}
