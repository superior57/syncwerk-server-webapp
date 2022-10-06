
import { map } from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { Subscription, Observable } from 'rxjs';

import { Action, Type } from '@enum/index.enum';
import { FilesService, NotificationService, MessageService, AdminService, NonAuthenticationService, AuthenticationService } from '@services/index';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-share-to-user',
  templateUrl: './share-to-user.component.html',
  styleUrls: ['./share-to-user.component.scss']
})

export class ShareToUserComponent implements OnInit, OnChanges {

  @Input() repoID: string;
  @Input() path: string;
  @Input() emailOwner: string;
  @Output() dfUser = new EventEmitter();

  private subscription: Subscription;
  public exampleData: Array<Select2OptionData>;
  PLACE_HOLDER_SEARCH_MESSAGE: string;
  ENABLE_GLOBAL_ADDRESSBOOK = false;
  permission = 'rw';
  errorMessage: string;
  // currentUser;
  listUserShared = [];
  // selectedUser;
  tagInputItemAdded: boolean;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  userListForShare = [];
  userForShare;

  viewHistory = true;
  viewSnapshot = false;
  restoreSnapshot = false;
  listChoosePermission = [];

  isCurrentLang = this.cookieService.get('lang');


  constructor(
    private filesService: FilesService,
    private adminService: AdminService,
    private messageService: MessageService,
    private noti: NotificationService,
    private translate: TranslateService,
    private nonAuthenticationService: NonAuthenticationService,
    private cookieService: CookieService,
    private authService: AuthenticationService,
  ) {
 }


  ngOnChanges(changes: SimpleChanges) {

    if ('repoID' in changes && 'path' in changes && 'emailOwner' in changes) {
      if (this.repoID !== '' && this.path !== '') {
        // this.selectedUser = null;
        this.permission = 'rw';
        this.errorMessage = '';
        this.getUserShared();
        // this.messageService.send(Type.Main_Page, Action.Share_To_User_Get_User_Info, '');
      }
    }
  }

  ngOnInit() {
    this.initData();
    // this.subscribe();
    // this.onChangePermission();
  }

  initData() {
    this.exampleData = [
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
  }

  getUserShared() {
    this.filesService.getListSharedFolder(this.repoID, 'user', this.path)
      .subscribe(resp => this.listUserShared = resp.data, error => console.error(error));
  }

  submitShareToUser() {
    if (this.userListForShare.length <= 0) {
      this.noti.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.YOU_MUST_SELECT_AS_LEAST_1_USER_TO_SHARE');
      return false;
    }
    for (const user of this.userListForShare) {
      this.handleItemUserForShare(user);
    }
  }

  handleItemUserForShare(userForShare: any) {
    this.errorMessage = '';
    if (userForShare.value === this.emailOwner) {
      this.noti.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.CANNOT_SHARE_FOLDER_TO_THE_OWNER');
      return false;
    }
    const body = {
      share_type: 'user',
      permission: this.permission,
      username: userForShare.value,
      allow_view_history: this.viewHistory ? 'true' : 'false',
      allow_view_snapshot: this.viewSnapshot ? 'true' : 'false',
      allow_restore_snapshot: this.restoreSnapshot ? 'true' : 'false',
    };
    this.share(body);
  }

  share(body: Object) {
    this.filesService.submitShareToUser(this.repoID, body, this.path)
      .subscribe(resp => {
        if (resp.data.success.length > 0) {
          for (const data of resp.data.success) {
            this.listUserShared.push(data);
          }
          this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.SHARE_FOLDER_TO_USER_SUCCESSFULLY');
        } else {
          this.noti.showNotification('danger', resp.data.failed[0].error_msg);
        }
        this.permission = 'rw';
        // this.selectedUser = '';
        this.userListForShare = [];
        this.userForShare = '';
      }, error => console.error(error));
  }

  changedSettingPermission(data: { value: string }) {
    this.permission = data.value;
  }

  changedPermissionData(data, index) {
    const body = {
      share_type: 'user',
      permission: data.value,
      username: this.listUserShared[index].user_info.name
    };
    this.filesService.updatePermissionToUser(this.repoID, body, this.path)
      .subscribe(resp => { }, error => console.error(error));
  }

  onEnter() {
    if (this.tagInputItemAdded) {
      this.tagInputItemAdded = false;
      return;
    }
    const valueUser = document.getElementById(`valueUser`);
    console.log(`You was enter ` + valueUser);

    this.submitShareToUser();
  }

  onItemAdded(e) {
    this.tagInputItemAdded = true;
  }

  removeUserShared(index, data) {
    this.dfUser.emit({ indexItem: index, dataItem: data });
  }

  deleteUserShared(index, data) {
    console.log('Go here');
    this.filesService.deleteUserSharedFolder(this.repoID, data.user_info.name, this.path)
      .subscribe(resp => {
        this.listUserShared.splice(index, 1);
        this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DELETE_SHARED_ITEM_SUCCESSFULLY');
      }, error => console.error(error));
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.filesService.searchUserForSharing(this.repoID, this.path, text).pipe(map(result => {
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

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  handleNameUserList(nameStr: string, limitStr: number = 35) {
    const name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    return name;
  }

  // onChangePermission() {
  //   this.listChoosePermission = [];
  //   if (this.isCurrentLang === 'en') {
  //     if (this.viewHistory) {
  //       this.listChoosePermission.push('View History');
  //     }
  //     if (this.viewSnapshot) {
  //       this.listChoosePermission.push('View Snapshot');
  //     }
  //     if (this.restoreSnapshot) {
  //       this.listChoosePermission.push('Restore Snapshot');
  //     }
  //   } else {
  //     if (this.viewHistory) {
  //       this.listChoosePermission.push('Siehe Verlauf');
  //     }
  //     if (this.viewSnapshot) {
  //       this.listChoosePermission.push('Schnappschuss anzeigen');
  //     }
  //     if (this.restoreSnapshot) {
  //       this.listChoosePermission.push('Schnappschuss wiederherstellen');
  //     }
  //   }
  // }
}
