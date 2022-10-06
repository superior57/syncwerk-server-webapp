
import {map} from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { Observable } from 'rxjs';
import { AdminService, NotificationService, FilesService, AuthenticationService } from 'app/services';

declare const jQuery: any;

@Component({
  selector: 'app-share-to-user-folders-all',
  templateUrl: './share-to-user-folders-all.component.html',
  styleUrls: ['./share-to-user-folders-all.component.scss']
})
export class ShareToUserFoldersAllComponent implements OnInit {

  @Input() repoID: string;
  @Input() emailOwner: string;
  @Output() dfUser = new EventEmitter();

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  permission = 'rw';
  listUserShared = [];
  tagInputItemAdded: boolean;
  userListForShare = [];
  params: any;

  ENABLE_GLOBAL_ADDRESSBOOK = false;

  // viewHistory = true;
  // viewSnapshot = false;
  // restoreSnapshot = false;
  // listChoosePermission = [];

  constructor(
    private filesService: FilesService,
    private adminService: AdminService,
    private notification: NotificationService,
    private translate: TranslateService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    jQuery('.scrollbar-outer').scrollbar();
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
    this.initData();
    this.getListUserShares();
  }

  initData() {
    this.exampleData = [
      { id: 'rw', text: this.translate.instant('MODAL_SHARE.READ_WRITE') },
      { id: 'r', text: this.translate.instant('MODAL_SHARE.READ_ONLY') }
    ];
  }

  getListUserShares() {
    this.adminService.getListUserShareToGroup(this.repoID, 'user')
      .subscribe(resps => {
        console.log(`hahaha --->`, resps);
        this.listUserShared = resps.data.shares;
      }, error => {
        console.error(error);
      });
  }

  submitShareToUser() {
    console.log(`userListForShare`, this.userListForShare);
    if (this.userListForShare.length <= 0) {
      this.notification.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.YOU_MUST_SELECT_AS_LEAST_1_USER_TO_SHARE');
      return false;
    }
    for (const user of this.userListForShare) {
      this.handleItemUserForShare(user);
    }
  }

  handleItemUserForShare(userForShare: any) {
    if (userForShare.value === this.emailOwner) {
      this.notification.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.CANNOT_SHARE_FOLDER_TO_THE_OWNER');
      return false;
    }
    this.shareToUser(userForShare.value);
  }

  shareToUser(emailUser: string) {
    this.adminService.postShareToUserGroup(this.repoID, 'user', emailUser, this.permission)
      .subscribe(resps => {
        if (resps.data.success.length > 0) {
          for (const data of resps.data.success) {
            this.listUserShared.push(data);
          }
          this.notification.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.ADDED_USERS_GROUPS_TO_SHARE_SUCCESSFULLY'));
        } else {
          this.notification.showNotification('danger', resps.data.failed[0].error_msg);
        }
        this.permission = 'rw';
        this.userListForShare = [];
      }, error => console.error(error));
  }

  changedSettingPermission(data: { value: string }) {
    this.permission = data.value;
  }

  changedPermissionData(data, emailUser: string) {
    this.adminService.putUpdateShareToUserGroupPermission(this.repoID, 'user', emailUser, data.value).subscribe(
      resps => this.notification.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.SHARE_PERMISSION_UPDATED_SUCCESSFULLY')),
      error => {
        this.notification.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  onEnter() {
    if (this.tagInputItemAdded) {
      this.tagInputItemAdded = false;
      return;
    }
    this.submitShareToUser();
  }

  onItemAdded(e) {
    this.tagInputItemAdded = true;
  }

  removeUserShared(dataItem: any) {
    this.dfUser.emit(dataItem);
  }

  confirmDeleteUserShare(dataItem: any) {
    this.adminService.deleteShareUserGroupPermission(dataItem.repo_id, dataItem.share_type, dataItem.user_email)
      .subscribe(resps => {
        this.getListUserShares();
        this.notification.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.DELETE_SHARED_ITEM_SUCCESSFULLY'));
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.filesService.searchUserForSharing(this.repoID, null, text).pipe(map(result => {
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
}
