import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Action, Type } from '@enum/index.enum';
import { AuthenticationService, MessageService, ShareAdminService, NotificationService, MeetingsService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';
import { sortByString, sortByColumn, onChangeTable } from 'app/app.helpers';

import { ModalDeleteRemoveComponent } from 'app/modules/shared/components/modal-delete-remove/modal-delete-remove.component';
import { CookieService } from 'ngx-cookie';

import * as moment from 'moment';

declare const jQuery: any;

@Component({
  selector: 'app-layout-share-admin',
  templateUrl: './layout-share-admin.html',
  styleUrls: ['./layout-share-admin.scss']
})
export class LayoutShareAdminComponent implements OnInit {

  @ViewChild(ModalDeleteRemoveComponent) private modalDeleteRemoveComponent;

  params: any;
  dataSharedFolders = [];
  listShares = [];
  isOpenUnshareModal = false;
  isOpenModal = {
    unshare: false,
    view: false,
    remove: false,
    share: false
  };
  itemCurrent = {};
  listSharedFolderDisplay: Array<any> = [];
  columns: Array<any> = [
    { title: 'TABLE.COLUMNS.NAME', name: 'item_name', width: '30%' },
    { title: 'TABLE.COLUMNS.UPDATED', name: 'mtime', width: '12.5%', is_filter: false, class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.SIZE', name: 'size', width: '10%', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.SHARE_TO', name: 'share_to', width: '15%', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.PERMISSIONS', name: 'share_permission', width: '12.5%', is_filter: false, class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.VISITS', name: 'view_cnt', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.EXPIRES', name: 'expire_date', class: 'd-none d-lg-table-cell' }
  ];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };
  page: any = {
    page: 1,
    itemsPerPage: 30
  };
  maxSize = 5;
  numPages = 1;
  length = 0;
  isProcessing = true;
  currentSharesItem: any;
  isListView = this.cookieService.get('syc_view_mode') === 'list_view' ? true : false;
  rangeSizeGrid;

  constructor(
    private shareAdminService: ShareAdminService,
    private router: Router,
    private notification: NotificationService,
    private translate: TranslateService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private meetingService: MeetingsService,
  ) { }

  ngOnInit() {
    this.handleCheckLogin();
    this.loadData();
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
  }

  handleCheckLogin() {
    this.authenticationService.checkLogin().subscribe(resp => {
      if (resp.data.is_guest === true) {
        this.messageService.send(Type.Main_Page, Action.Page_Not_Found, true);
      }
    });
  }

  async loadData() {
    await this.getListShares();
    await this.handleDataListShares();
    this.changeTable();
    this.isProcessing = false;
  }

  getListShares(): Promise<any> {
    return new Promise((resolve, reject) => this.shareAdminService.getShares().subscribe(resps => {
      this.listShares = resps.data;
      for (const share of this.listShares) {
        share.link = `${window.location.origin}/${share.link}`;
        if (!share.mtime) {
          share.mtime = moment(share.ctime).format('X');
        }
      }
      resolve();
    }));
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.listShares, this.columns, config, this.page);
    this.listSharedFolderDisplay = data.rows;
    this.listSharedFolderDisplay.forEach((item, index) => {
      if (item.type === 'repo') {
        item.displayed_item_name = `${item.item_name}`;
        item.tooltip_item_name = `${item.item_name}`;
      } else if (item.type === 'upload-link') {
        item.displayed_item_name = `${item.item_name}`;
        item.tooltip_item_name = `${item.item_name}`;
      } else {
        if (item.is_dir) {
          item.displayed_item_name = `${item.item_name}`;
          item.tooltip_item_name = `${item.item_name}`;
        } else {
          item.displayed_item_name = `${item.item_name}`;
          item.tooltip_item_name = `${item.item_name}`;
        }
      }
    });
    this.length = data.length;
  }


  // flag

  changeTable(config = this.config, page = this.page) {
    const data = onChangeTable(config, this.listShares, this.columns, page);
    this.listSharedFolderDisplay = data.rows;
    this.listSharedFolderDisplay.forEach((item, index) => {
      if (item.type === 'repo') {
        item.displayed_item_name = `/${item.item_name}/`;
        item.tooltip_item_name = `/${item.item_name}/`;
      } else if (item.type === 'upload-link') {
        item.displayed_item_name = `/${item.item_name}`;
        item.tooltip_item_name = `/${item.item_name}`;
      } else if (item.type === 'download-link') {
        if (item.is_dir === false) {
          item.displayed_item_name = `${item.item_name}`;
          item.tooltip_item_name = `${item.item_name}`;
        } else {
          item.displayed_item_name = `${item.item_name}`;
          item.tooltip_item_name = `${item.item_name}`;
        }
      } else {
        if (item.is_dir) {
          item.displayed_item_name = `/${item.item_name}`;
          item.tooltip_item_name = `/${item.item_name}`;
        } else {
          item.displayed_item_name = `${item.item_name}/`;
          item.tooltip_item_name = `/${item.item_name}`;
        }
      }
    });
    this.length = data.length;
  }

  handleDataListShares(): Promise<any> {
    return new Promise(resolve => {
      this.listShares.forEach(ele => {
        if (ele.type === 'repo' || ele.type === 'folder') {
          ele.item_name = ele.type === 'repo' ? ele.repo_name : ele.path;
          if (ele.share_type === 'personal') {
            ele.share_to = ele.user_email;
          } else if (ele.share_type === 'public') {
            ele.share_to = `All cloud users`;
          } else if (ele.share_type === 'group') {
            ele.share_to = `Group - ${ele.group_name}`;
          }
        } else if (ele.type === 'download-link') {
          ele.item_name = this.handleItemName(ele.repo_name, ele.path, '');
          ele.share_to = 'Download link';
        } else if (ele.type === 'upload-link') {
          ele.item_name = this.handleItemName(ele.repo_name, ele.path, '');
          ele.share_to = 'Upload link';
        }
        if (!ele.hasOwnProperty('view_cnt')) {
          ele.view_cnt = '-';
        }
        if (!ele.expire_date) {
          ele.expire_date = '-';
        }
      });
      resolve();
    });
  }

  handleItemName(repoName, path, objName) {
    if (path === '/' && objName === '/') {
      return repoName;
    } else {
      return repoName + path + objName;
    }
  }

  handleOpenModal(typeModal: string, currentItemData: any = null) {
    if (currentItemData !== null) { this.currentSharesItem = currentItemData; }
    if (typeModal === 'unshare') {
      this.isOpenModal.unshare = true;
      this.openModal('#unshare-modal', () => this.isOpenModal.unshare = false);
    } else if (typeModal === 'view') {
      this.isOpenModal.view = true;
      this.openModal('#view-link-modal', () => this.isOpenModal.view = false);
    } else if (typeModal === 'remove') {
      this.isOpenModal.remove = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.remove = false);
    } else if (typeModal === 'share') {
      this.currentSharesItem = {
        repoID: currentItemData.repo_id,
        path: currentItemData.path,
        type: currentItemData.type,
        name: currentItemData.item_name,
        encrypted: false,
        permission: currentItemData.share_permission,
        owner: currentItemData.username,
      };
      this.isOpenModal.share = true;
      this.openModal('#share-modal', () => this.isOpenModal.share = false);
    }
  }

  openModal(idModal: string, func: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', func).modal('show'));
  }

  onUnshareItem(dataItem: { [key: string]: any } = Object) {
    const shareToKey = this.handleShareToKey(dataItem.share_type, dataItem);
    if (dataItem.type === 'repo') {
      this.unshareSharedRepos(dataItem, shareToKey);
    } else if (dataItem.type === 'folder') {
      this.unshareSharedSubfolder(dataItem, shareToKey);
    }
  }

  unshareSharedRepos(dataItem, shareToKey: string) {
    this.shareAdminService.deleteSharedRepos(dataItem.repo_id, dataItem.share_type, shareToKey)
      .subscribe(resps => {
        this.loadData();
        jQuery('#unshare-modal').modal('hide');
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  unshareSharedSubfolder(dataItem, shareToKey: string) {
    this.shareAdminService.deleteDirSharedItems(dataItem.repo_id, dataItem.path, shareToKey, dataItem.share_type)
      .subscribe(resps => {
        this.loadData();
        jQuery('#unshare-modal').modal('hide');
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  onRemoveItem() {
    if (this.currentSharesItem.type === 'download-link') {
      this.removeSharedDownloadLink();
    } else if (this.currentSharesItem.type === 'upload-link') {
      this.removeSharedUploadLink();
    } else if (this.currentSharesItem.type === 'meeting-public-share') {
      this.removePublicSharedMeting();
    } else if (this.currentSharesItem.type === 'meeting-private-share') {
      this.removePrivateSharedMeting();
    }
  }

  removePrivateSharedMeting() {
    if(this.currentSharesItem.share_type === 'SHARED_TO_USER') {
      this.meetingService.deleteSharedToUserEntry(this.currentSharesItem.meeting_room_id, this.currentSharesItem.share_entry_id)
        .subscribe(resps => {
          this.loadData();
          jQuery('#modal-delete-remove').modal('hide');
          this.notification.showNotification('success', resps.message);
        }, error => {
          console.error(error);
          this.modalDeleteRemoveComponent.isProcessing = false;
          this.notification.showNotification('danger', JSON.parse(error._body).message);
        });
    } else if (this.currentSharesItem.share_type === 'SHARED_TO_GROUP') {
      this.meetingService.deleteSharedToGroupEntry(this.currentSharesItem.meeting_room_id, this.currentSharesItem.share_entry_id)
        .subscribe(resps => {
          this.loadData();
          jQuery('#modal-delete-remove').modal('hide');
          this.notification.showNotification('success', resps.message);
        }, error => {
          console.error(error);
          this.modalDeleteRemoveComponent.isProcessing = false;
          this.notification.showNotification('danger', JSON.parse(error._body).message);
        });
    }
  }

  removePublicSharedMeting() {
    this.meetingService.deleteRemoveMeetingRoomPublicLink(this.currentSharesItem.meeting_room_id)
    .subscribe(resps => {
      this.loadData();
      jQuery('#modal-delete-remove').modal('hide');
      this.notification.showNotification('success', resps.message);
    }, error => {
      console.error(error);
      this.modalDeleteRemoveComponent.isProcessing = false;
      this.notification.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  removeSharedDownloadLink() {
    this.shareAdminService.removeSharedDownloadLink(this.currentSharesItem.token)
      .subscribe(resps => {
        this.loadData();
        jQuery('#modal-delete-remove').modal('hide');
        this.notification.showNotification('success', resps.message === '' ? this.translate.instant('NOTIFICATION_MESSAGE.SHARE_LINK_WAS_DELETED_SUCCESSFULLY') : resps.message);
      }, error => {
        console.error(error);
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  removeSharedUploadLink() {
    this.shareAdminService.removeSharedUploadLink(this.currentSharesItem.token)
      .subscribe(resps => {
        this.loadData();
        jQuery('#modal-delete-remove').modal('hide');
        this.notification.showNotification('success', resps.message === '' ? this.translate.instant('NOTIFICATION_MESSAGE.SHARE_LINK_WAS_DELETED_SUCCESSFULLY') : resps.message);
      }, error => {
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  changedSettingPermission(type, data: { value: string }, dataItem) {
    this.currentSharesItem = dataItem;
    const shareToKey = this.handleShareToKey(type, this.currentSharesItem);
    if (this.currentSharesItem.type === 'repo') {
      this.changePermissionSharedRepos(data, type, shareToKey);
    } else if (this.currentSharesItem.type === 'folder') {
      this.changePermissionSharedSubfolder(data, type, shareToKey);
    }
  }

  changePermissionSharedRepos(data: { value: string }, type, shareToKey) {
    this.shareAdminService.putSharedRepos(this.currentSharesItem.repo_id, type, data.value, shareToKey)
      .subscribe(resps => {
        this.loadData();
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
    // this.editPermissionIndex = -1;
  }

  changePermissionSharedSubfolder(data: { value: string }, shareType, shareToKey) {
    const itemCurrent = this.currentSharesItem;
    this.shareAdminService.postDirSharedItems(itemCurrent.repo_id, itemCurrent.path, shareToKey, shareType, data.value)
      .subscribe(resps => {
        this.loadData();
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  handleShareToKey(type: string, dataItem) {
    if (type === 'personal') {
      return dataItem.user_email;
    } else if (type === 'group') {
      return dataItem.group_id;
    } else {
      return;
    }
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.changeTable();
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  onOpenModal(data) {
    this.handleOpenModal(data.type, data.currentItem);
  }

  onChangePermission(data) {
    this.changedSettingPermission(data.type, data.data, data.dataItem);
  }
}
