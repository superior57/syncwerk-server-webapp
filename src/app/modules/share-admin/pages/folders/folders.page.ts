import { Component, OnInit } from '@angular/core';
import { ShareAdminService, NotificationService } from 'app/services';
import { Router } from '@angular/router';
import { Select2OptionData } from 'ng2-select2';
import { sortByString, sortByColumn, onChangeTable } from 'app/app.helpers';
import { TranslateService } from '@ngx-translate/core';

declare const jQuery: any;

@Component({
  selector: 'app-folders',
  templateUrl: './folders.page.html',
  styleUrls: ['./folders.page.scss']
})
export class FoldersPageComponent implements OnInit {

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  public perPageSelectData: Array<Select2OptionData> = [];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  params: any;
  dataSharedFolders = [];
  editPermissionIndex = -1;
  isOpenUnshareModal = false;
  itemCurrent = {};
  listSharedFolderDisplay: Array<any> = [];
  columns: Array<any> = [];
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

  constructor(
    private shareAdminService: ShareAdminService,
    private router: Router,
    private notification: NotificationService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.initDataSelect();
    setTimeout(() => {
      this.initDataTable();
    }, 600);
  }

  initDataSelect() {
    this.exampleData = [
      { id: 'rw', text: 'Read-Write' },
      { id: 'r', text: 'Read-Only' }
    ];
  }

  initDataTable() {
    this.perPageSelectData = [
      { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
      { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
      { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
      { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
    ];
    this.columns = [
      { title: 'TABLE.COLUMNS.NAME', name: 'repo_name', width: '45%' },
      { title: 'TABLE.COLUMNS.SHARE_TYPE', name: 'share_type', width: '12.5%' },
      { title: 'TABLE.COLUMNS.SHARE_TO', name: 'share_to', width: '15%' },
      { title: 'TABLE.COLUMNS.PERMISSION', name: 'share_permission', width: '12.5%' }
    ];
    this.config.sorting.columns = this.columns;
    this.loadData();
  }

  async loadData() {
    await this.getListSharedRepos();
    await this.addShareTo();
    const data = onChangeTable(this.config, this.dataSharedFolders, this.columns, this.page);
    this.listSharedFolderDisplay = data.rows;
    this.length = data.length;
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.dataSharedFolders, this.columns, config, this.page);
    this.listSharedFolderDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.dataSharedFolders, this.columns, page);
    this.listSharedFolderDisplay = data.rows;
    this.length = data.length;
  }

  getListSharedRepos(): Promise<any> {
    return new Promise(resolve => {
      this.shareAdminService.getSharedRepos().subscribe(resps => {
        this.dataSharedFolders = resps.data;
        resolve();
      });
    });
  }

  addShareTo(): Promise<any> {
    return new Promise(resolve => {
      this.dataSharedFolders.forEach(element => {
        if (element.share_type === 'personal') {
          element.share_to = element.user_name;
        } else if (element.share_type === 'group') {
          element.share_to = element.group_name;
        } else if (element.share_type === 'public') {
          element.share_to = 'all members';
        }
      });
      resolve();
    });
  }

  navigateRepo(repoId: string) {
    this.router.navigate(['folders', repoId]);
  }

  unshareSharedFolder(itemCurrent: Object) {
    this.itemCurrent = itemCurrent;
    this.openModal();
  }

  openModal() {
    this.isOpenUnshareModal = true;
    return new Promise((resolve, reject) => setTimeout(() => {
      jQuery('#unshare-modal').on('hidden.bs.modal', () => this.isOpenUnshareModal = false).modal('show');
    }));
  }

  unshareCallBack(data: { [key: string]: any } = Object) {
    const shareToKey = this.handleShareToKey(data.share_type, data);
    this.shareAdminService.deleteSharedRepos(data.repo_id, data.share_type, shareToKey)
      .subscribe(resps => {
        this.loadData();
        jQuery('#unshare-modal').modal('hide');
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  onFocusOut() {
    setTimeout(() => this.editPermissionIndex = -1, 500);
  }

  changedSettingPermission(type, data: { value: string }, itemCurrent: { [key: string]: any } = Object) {
    // TODO: add case change per of shared group
    const shareToKey = this.handleShareToKey(type, itemCurrent);
    this.shareAdminService.putSharedRepos(itemCurrent.repo_id, type, data.value, shareToKey)
      .subscribe(resps => {
        this.loadData();
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
    this.editPermissionIndex = -1;
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
    this.loadData();
  }
}
