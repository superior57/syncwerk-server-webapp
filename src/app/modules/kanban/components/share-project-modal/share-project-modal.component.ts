import { Component, OnInit } from '@angular/core';

import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FilesService, GroupsService, NonAuthenticationService, NotificationService, KanbanService, AuthenticationService } from 'app/services';


@Component({
  selector: 'app-share-project-modal',
  templateUrl: './share-project-modal.component.html',
  styleUrls: ['./share-project-modal.component.scss']
})
export class ShareProjectModalComponent implements OnInit {

  selectedProject: any = {};
  errorMessage: string;
  permission = 'rw';
  shareTypes: Array<Select2OptionData>;
  tagInputItemAdded: boolean;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  // share link tab
  data;
  isLoading = false;
  isSendMail = false;
  // user share tab
  userForShare;
  userListForShare = [];
  listUserShared = [];
  PLACE_HOLDER_SEARCH_MESSAGE: string;
  ENABLE_GLOBAL_ADDRESSBOOK = false;
  // group share tab
  groupListForShare = [];
  groupShareds: any[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    protected kanBanService: KanbanService,
    protected notify: NotificationService,
    protected authService: AuthenticationService,
    protected translate: TranslateService,
    protected groupsService: GroupsService,
    protected filesService: FilesService,
    protected nonAuthenticationService: NonAuthenticationService,
  ) { }

  ngOnInit() {
    this.shareTypes = [
      { id: 'rw', text: this.translate.instant('MODAL_SHARE.READ_WRITE') },
      { id: 'r', text: this.translate.instant('MODAL_SHARE.READ_ONLY') }
    ];
    this.nonAuthenticationService.getRestapiSettingsByKeys('ENABLE_GLOBAL_ADDRESSBOOK').subscribe((resp) => {
      if (resp.data.config_dict.ENABLE_GLOBAL_ADDRESSBOOK) {
        this.authService.userInfo().subscribe(resp1 => {
          if (resp1.data.permissions.can_use_global_address_book === false) {
            this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER_NO_ADDRESSBOOK');
            this.ENABLE_GLOBAL_ADDRESSBOOK = false;
          } else {
            this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER');
            this.ENABLE_GLOBAL_ADDRESSBOOK = true;
          }
        });
        this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER');
        this.ENABLE_GLOBAL_ADDRESSBOOK = true;
      } else {
        this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER_NO_ADDRESSBOOK');
        this.ENABLE_GLOBAL_ADDRESSBOOK = false;
      }
    });
    // get existing share links
    this.kanBanService.getShareLinks(this.selectedProject.id).subscribe(resp => {
        for (const s of resp) {
          this.data = s;
          this.data.link = `${window.location.origin}${this.data.link}`;
        }
      } , error => console.error(error));
    // get all project shares (users + groups)
    this.kanBanService.getProjectMembers(this.selectedProject.id)
      .subscribe(resp => {
        for (const s of resp) {
          if (s.share_type === 'U') {
            this.listUserShared.push(s);
          } else if (s.share_type === 'G') {
            this.groupShareds.push(s);
          }
        }
      } , error => console.error(error));
  }

  // SHARE LINK TAB HANDLERS
  getLink() {
    return this.data.link;
  }

  submitCopy() {
    this.notify.showNotificationByMessageKey(
      'success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }

  generateShareLink(data) {
    data['project'] = this.selectedProject.id;
    if (data['expire_days']) {
      const date = new Date();
      date.setDate(date.getDate() + Number.parseInt(data['expire_days']));
      data['expire_date'] = date;
    }
    this.isLoading = true;
    this.kanBanService.createShareLink(data)
      .subscribe(resp => {
        this.data = resp;
        this.data.link = `${window.location.origin}${this.data.link}`;
        this.isLoading = false;
      }, error => console.error(error));
  }

  deleteLink() {
    this.kanBanService.deleteShareLink(this.data.id)
      .subscribe(resp => {
        this.data = null;
        this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DELETE_SHARED_DOWNLOAD_LINK_SUCCESSFULLY');
      }, error => {
        console.log(error);
      });
  }

  openFormSend() {
    this.isSendMail = true;
  }

  cancelSendEmail() {
    this.isSendMail = false;
  }

  // SHARE TO USER TAB HANDLERS
  submitShareToUser() {
    if (this.userListForShare.length <= 0) {
      this.notify.showNotificationByMessageKey(
        'danger', 'NOTIFICATION_MESSAGE.YOU_MUST_SELECT_AS_LEAST_1_USER_TO_SHARE');
      return false;
    }
    for (const user of this.userListForShare) {
      this.handleItemUserForShare(user);
    }
  }

  handleItemUserForShare(userForShare: any) {
    this.errorMessage = '';
    if (userForShare.value === this.selectedProject.owner.email) {
      this.notify.showNotificationByMessageKey(
        'danger', 'NOTIFICATION_MESSAGE.CANNOT_SHARE_FOLDER_TO_THE_OWNER');
      return false;
    }
    const body = {
      share_type: 'U',
      kanban_project: this.selectedProject.id,
      permission: this.permission,
      user_id: userForShare.value,
    };
    this.kanBanService.addMember(body).subscribe((res) => {
      console.log(res);
      if (res.id) {
        this.listUserShared.push(res);
        this.notify.showNotification(
          'success', this.translate.instant('KANBAN.MODALS.ADD_MEMBER_SUCCESS'));
      } else {
        this.notify.showNotification('danger', res.data.failed[0].error_msg);
      }
      this.permission = 'rw';
      this.userListForShare = [];
      this.userForShare = '';
    }, err => {
      this.notify.showNotification('danger', this.translate.instant('KANBAN.MODALS.ADD_MEMBER_ERROR'));
    });
  }

  changedSettingPermission(data: { value: string }) {
    this.permission = data.value;
  }

  changedUserPermissionData(data, index) {
    const body = {
      id: this.listUserShared[index].id,
      permission: data.value,
    };
    this.kanBanService.updateMember(body).subscribe(
      resp => { }, error => console.error(error));
  }

  onUserNameEnter() {
    if (this.tagInputItemAdded) {
      this.tagInputItemAdded = false;
      return;
    }
    const valueUser = document.getElementById(`valueUser`);
    this.submitShareToUser();
  }

  onItemAdded(e) {
    this.tagInputItemAdded = true;
  }

  deleteUserShared(index, data) {
    console.log('Go here');
    this.kanBanService.removeMember(data.id)
      .subscribe(resp => {
        this.listUserShared.splice(index, 1);
        this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DELETE_SHARED_ITEM_SUCCESSFULLY');
      }, error => console.error(error));
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.groupsService.searchUser(text).pipe(map(result => {
      console.log(result);
      const autoCompleteUserList = [];
      for (const user of result.data.users) {
        autoCompleteUserList.push({
          display: this.handleNameUserList(user.name),
          value: user.email,
          templateData: user,
        });
      }
      return autoCompleteUserList;
    }));
  }

  public autoCompleteMatching = (value, target): boolean => {
    return true;
  }

  handleNameUserList(nameStr: string, limitStr: number = 35) {
    const name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    return name;
  }

  // SHARE TO GROUP TAB HANDLERS
  deleteGroupShared(index, data) {
    this.kanBanService.removeMember(data.id).subscribe(resp => {
        this.groupShareds.splice(index, 1);
        this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DELETE_SHARED_ITEM_SUCCESSFULLY');
      }, error => {
        console.error(error);
      });
  }

  shareToGroups() {
    console.log(this.groupListForShare);
    if (this.groupListForShare.length <= 0) {
      this.notify.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.MUST_SELECT_GROUP_TO_SHARE');
      return false;
    }
    for (const group of this.groupListForShare) {
      this.errorMessage = '';
      if (group.value === '') {
        this.notify.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.MUST_SELECT_GROUP_TO_SHARE');
        return false;
      }
      const body = {
        share_type: 'G',
        kanban_project: this.selectedProject.id,
        permission: this.permission,
        group_id: group.value,
        user_id: '',
      };
      this.kanBanService.addMember(body).subscribe((res) => {
        console.log(res);
        if (res.id) {
          this.groupShareds.push(res);
          this.notify.showNotification(
            'success', this.translate.instant('KANBAN.MODALS.ADD_MEMBER_SUCCESS'));
        } else {
          this.notify.showNotification('danger', res.data.failed[0].error_msg);
        }
        this.permission = 'rw';
        this.groupListForShare = [];
      }, err => {
        this.notify.showNotification('danger', this.translate.instant('KANBAN.MODALS.ADD_MEMBER_ERROR'));
      });
    }
  }

  changedGroupPermissionData(data, index) {
    const body = {
      id: this.groupShareds[index].id,
      permission: data.value,
    };
    this.kanBanService.updateMember(body).subscribe(
      resp => { }, error => console.error(error));
  }

  public autocompleteGroupList = (text: string): Observable<any> => {
    return this.filesService.searchEntries(text, 'group').pipe(map(result => {
      return result.data.map(group => {
        return {
          display: group.name,
          value: group.id,
          group,
        };
      });
    }));
  }

  onGroupNameEnter() {
    if (this.tagInputItemAdded) {
      this.tagInputItemAdded = false;
      return;
    }
    this.shareToGroups();
  }
}
