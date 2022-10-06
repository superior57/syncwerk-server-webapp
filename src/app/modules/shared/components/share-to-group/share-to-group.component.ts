
import { map } from 'rxjs/operators';
import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { Subscription, Observable } from 'rxjs';

import { Type } from '@enum/index.enum';
import { FilesService, NotificationService, MessageService } from '@services/index';

declare const jQuery: any;

@Component({
  selector: 'app-share-to-group',
  templateUrl: './share-to-group.component.html',
  styleUrls: ['./share-to-group.component.scss']
})
export class ShareToGroupComponent implements OnInit, OnDestroy {

  searchType = 'group';
  private subscription: Subscription;
  @Input() id = '';
  @Input() Path = '/';
  @Output() dfGroup = new EventEmitter();
  public exampleData: Array<Select2OptionData>;
  permission = 'rw';
  groupShareds: any[] = [];
  selectedGroup;
  errorMessage;
  tagInputItemAdded;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  groupListForShare = [];

  constructor(
    private filesService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
    private translate: TranslateService
  ) {
    this.subscribe();
  }

  ngOnInit() {
    setTimeout(() => {
      jQuery('#share-modal').on('hide.bs.modal', (event) => {
        if (this.groupListForShare.length > 0) {
          const result = confirm(this.translate.instant('MODAL_SHARE.SHARE_CLOSE_MODAL_PROMT_UNSAVE_DATA'));
          if (!result) {
            event.preventDefault();
          }
        }
      });
    }, 0);
    this.initData();
  }

  initData() {
    this.exampleData = [
      { id: 'rw', text: this.translate.instant('MODAL_SHARE.READ_WRITE') },
      { id: 'r', text: this.translate.instant('MODAL_SHARE.READ_ONLY') }
    ];
  }

  changedSettingPermission(data: { value: string }) {
    this.permission = data.value;
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Share_To_Group, (payload) => {
      this.selectedGroup = null;
      this.permission = 'rw';
      this.errorMessage = '';
      // this.child.resetField();
      // this.child.placeholder = 'Search groups';
      this.getGroupShared(this.id);
    });
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  // Action from auto complete
  selectedValue(data) {
    this.selectedGroup = data;
    if (data !== '') {
      this.errorMessage = '';
    }
  }

  changedPermissionData(data, index) {
    const body = {
      share_type: 'group',
      permission: data.value,
      group_id: this.groupShareds[index].group_info.id
    };
    this.filesService.updatePermissionToGroup(this.id, body, this.Path)
      .subscribe(resp => {
      }, error => {
        console.error(error);
      });
  }

  removeGroupShared(index, data) {
    this.dfGroup.emit({ indexItem: index, dataItem: data });
  }

  deleteGroupShared(index, data) {
    this.filesService.deleteGroupSharedFolder(this.id, data.group_info.id, this.Path)
      .subscribe(resp => {
        this.groupShareds.splice(index, 1);
        this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DELETE_SHARED_ITEM_SUCCESSFULLY');
      }, error => {
        console.error(error);
      });
  }

  shareToGroups() {
    console.log(this.groupListForShare);
    if (this.groupListForShare.length <= 0) {
      this.noti.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.MUST_SELECT_GROUP_TO_SHARE');
      return false;
    }
    for (const group of this.groupListForShare) {
      this.share(group.value);
    }
  }

  share(groupName) {
    this.errorMessage = '';
    this.selectedGroup = groupName;
    if (this.selectedGroup === '') {
      this.noti.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.MUST_SELECT_GROUP_TO_SHARE');
      return false;
    }
    const body = {
      share_type: 'group',
      permission: this.permission,
      group_name: groupName,
    };
    this.filesService.shareFolderToGroup(this.id, body, this.Path)
      .subscribe(resp => {
        if (resp.data.success.length > 0) {
          for (const data of resp.data.success) {
            this.groupShareds.push(data);
          }
          this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.SHARE_TO_GROUP_SUCCESS');
        } else {
        }
        this.permission = 'rw';
        this.selectedGroup = '';
        this.groupListForShare = [];
        // this.child.resetField();
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  getGroupShared(folderId: string) {
    this.filesService.getListSharedFolder(folderId, 'group', this.Path)
      .subscribe(resp => {
        this.groupShareds = resp.data;
      }, error => {
      });
  }

  public autocompleteGroupList = (text: string): Observable<any> => {
    return this.filesService.searchGroupForSharing(this.id, this.Path, text).pipe(map(result => {
      return result.data.map(group => {
        return {
          display: group.name,
          value: group.name,
          group,
        };
      });
    }));
  }

  public autocompleteGroupMatching = (value, target): boolean => {
    return true;
  }

  onEnter() {
    if (this.tagInputItemAdded) {
      this.tagInputItemAdded = false;
      return;
    }
    this.shareToGroups();
  }

  onItemAdded(event) {
    this.tagInputItemAdded = true;
  }
}
