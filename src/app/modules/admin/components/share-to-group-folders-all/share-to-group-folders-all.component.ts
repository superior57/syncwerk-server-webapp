
import { map } from 'rxjs/operators';
import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { Observable } from 'rxjs';

import { AdminService, NotificationService, FilesService } from 'app/services';

@Component({
  selector: 'app-share-to-group-folders-all',
  templateUrl: './share-to-group-folders-all.component.html',
  styleUrls: ['./share-to-group-folders-all.component.scss']
})
export class ShareToGroupFoldersAllComponent implements OnInit {

  @ViewChild('selectPermission') test: ElementRef;

  @Input() repoID: string;
  @Input() emailOwner: string;

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  listGroupShared = [];
  groupListForShare = [];
  permission = 'rw';
  tagInputItemAdded: boolean;
  params: any;

  @Output() dfGroup = new EventEmitter();

  constructor(
    private adminService: AdminService,
    private filesService: FilesService,
    private notification: NotificationService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.initData();
    this.getListGroupShares();
  }

  initData() {
    this.exampleData = [
      { id: 'rw', text: this.translate.instant('MODAL_SHARE.READ_WRITE') },
      { id: 'r', text: this.translate.instant('MODAL_SHARE.READ_ONLY') }
    ];
  }

  getListGroupShares() {
    this.adminService.getListUserGroupShares(this.repoID, 'group')
      .subscribe(resps => {
        this.listGroupShared = resps.data;
      });
  }

  submitShareToGroup() {
    if (this.groupListForShare.length <= 0) {
      this.notification.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.YOU_MUST_SELECT_AS_LEAST_1_USER_TO_SHARE');
      return false;
    }
    for (const group of this.groupListForShare) {
      this.handleItemGroupForShare(group);
    }
  }

  handleItemGroupForShare(groupForShare: any) {
    if (groupForShare.value === this.emailOwner) {
      this.notification.showNotificationByMessageKey('danger', 'NOTIFICATION_MESSAGE.CANNOT_SHARE_FOLDER_TO_THE_OWNER');
      return false;
    }
    this.shareToGroup(groupForShare.value);
  }

  shareToGroup(emailUser: string) {
    this.adminService.postShareToUserGroup(this.repoID, 'group', emailUser, this.permission)
      .subscribe(resps => {
        if (resps.data.success.length > 0) {
          this.getListGroupShares();
          this.notification.showNotification('success', resps.message);
        } else {
          this.notification.showNotification('danger', resps.data.failed[0].error_msg);
        }
        this.permission = 'rw';
        this.groupListForShare = [];
      }, error => console.error(error));
  }

  public autocompleteGroupList = (text: string): Observable<any> => {
    return this.filesService.searchGroupForSharing(this.repoID, null, text).pipe(map(result => {
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

  onItemAdded(e) {
    this.tagInputItemAdded = true;
  }

  changedSettingPermission(data: { value: string }) {
    this.permission = data.value;
  }

  onEnter() {
    if (this.tagInputItemAdded) {
      this.tagInputItemAdded = false;
      return;
    }
    this.submitShareToGroup();
  }

  changedPermissionData(data, dataItem: any) {
    this.adminService.putUpdateShareToUserGroupPermission(dataItem.repo_id, dataItem.share_type, dataItem.group_id, data.value).subscribe(
      resps => this.notification.showNotification('success', resps.message),
      error => {
        this.notification.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  removeGroupShared(dataItem: any) {
    this.dfGroup.emit(dataItem);
  }

  confirmDeleteGroupShare(dataItem: any) {
    this.adminService.deleteShareUserGroupPermission(dataItem.repo_id, dataItem.share_type, dataItem.group_id)
      .subscribe(resps => {
        this.getListGroupShares();
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }
}
