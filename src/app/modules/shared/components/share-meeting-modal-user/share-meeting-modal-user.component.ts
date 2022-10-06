import { Component, OnInit, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';

import { FilesService, NotificationService, MeetingsService, NonAuthenticationService, AuthenticationService, AdminService } from '@services/index';


@Component({
  selector: 'app-share-meeting-modal-user',
  templateUrl: './share-meeting-modal-user.component.html',
  styleUrls: ['./share-meeting-modal-user.component.scss']
})
export class ShareMeetingModalUserComponent implements OnInit {

  @Input() meetingRoomId = -1;
  @Input() isAdministration = false;

  public exampleData: Array<Select2OptionData>;
  PLACE_HOLDER_SEARCH_MESSAGE: string;

  ENABLE_GLOBAL_ADDRESSBOOK = true;

  userSharedFromAPI = [];

  userListForShare = [];
  userForShare;

  meetingRoleOptions = [];

  tagInputItemAdded: boolean;

  selectedRole = 'ATTENDEE';
  modalService: any = null;

  public roleSelectData: Array<Select2OptionData> = [
    { id: 'ATTENDEE', text: 'Attendee' },
    { id: 'MODERATOR', text: 'Moderator' },
  ];

  public roleSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  constructor(
    private translate: TranslateService,
    private nonAuthenticationService: NonAuthenticationService,
    private authService: AuthenticationService,
    private meetingsService: MeetingsService,
    private adminService: AdminService,
    private notify: NotificationService
  ) { }

  ngOnInit() {
    this.modalService = this.meetingsService;
    if (this.isAdministration == true) {
      this.modalService = this.adminService;
    }
    this.getListSharedToUsers();
  }

  initData() {
    this.exampleData = [
      { id: 'rw', text: this.translate.instant('MODAL_SHARE.READ_WRITE') },
      { id: 'r', text: this.translate.instant('MODAL_SHARE.READ_ONLY') }
    ];

    // this.nonAuthenticationService.getRestapiSettingsByKeys('ENABLE_GLOBAL_ADDRESSBOOK').subscribe((resp) => {
    //   if (resp.data.config_dict.ENABLE_GLOBAL_ADDRESSBOOK) {
    //     this.authService.userInfo().subscribe(resp1 => {
    //       if (resp1.data.permissions.can_use_global_address_book === false) {
    //         this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER_NO_ADDRESSBOOK');
    //         this.ENABLE_GLOBAL_ADDRESSBOOK = false;
    //       } else {
    //         this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER');
    //         this.ENABLE_GLOBAL_ADDRESSBOOK = true;
    //       }
    //     });
    //     this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER');
    //     this.ENABLE_GLOBAL_ADDRESSBOOK = true;
    //   } else {
    //     this.PLACE_HOLDER_SEARCH_MESSAGE = this.translate.instant('SEARCHS.USER_NO_ADDRESSBOOK');
    //     this.ENABLE_GLOBAL_ADDRESSBOOK = false;
    //   }
    // });
  }

  getListSharedToUsers() {
    this.modalService.getSharedToUserList(this.meetingRoomId).subscribe(resp => {
      this.userSharedFromAPI = resp.data.data;
    }, err => {
      const errorBody = JSON.parse(err._body);
    })
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    if (this.isAdministration) {
      return this.adminService.getSearchUser(text).pipe(map(result => {
        const autoCompleteUserList = [];
        for (const user of result.data.users) {
          autoCompleteUserList.push({
            display: this.handleNameUserList(user.email),
            value: user.email,
            templateData: user,
          });
        }
        return autoCompleteUserList;
      }));
    } else {
      return this.meetingsService.getSearchUser(text).pipe(map(result => {
        const autoCompleteUserList = [];
        for (const user of result.data.users) {
          autoCompleteUserList.push({
            display: this.handleNameUserList(user.email),
            value: user.email,
            templateData: user,
          });
        }
        return autoCompleteUserList;
      }));
    }

  }

  handleNameUserList(nameStr: string, limitStr: number = 35) {
    const name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    return name;
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
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

  onRoleSelectChange(event) {
    this.selectedRole = event.value;
  }

  submitShareToUser() {
    const shareToEmailStr = this.userListForShare.map((userObj) => userObj.value).join(',');
    const selectedRole = this.selectedRole;

    this.modalService.postSubmitShareToUser(shareToEmailStr, selectedRole, this.meetingRoomId).subscribe(resp => {
      this.getListSharedToUsers();
      this.userListForShare = [];
      this.notify.showNotificationByMessageKey('success', resp.message);
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    })
  }

  removeShareToUserEntry(shareEntry) {
    this.modalService.deleteSharedToUserEntry(shareEntry.meeting_room_id, shareEntry.id).subscribe(resp => {
      this.getListSharedToUsers();
      this.notify.showNotificationByMessageKey('success', resp.message);
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    })
  }

}
