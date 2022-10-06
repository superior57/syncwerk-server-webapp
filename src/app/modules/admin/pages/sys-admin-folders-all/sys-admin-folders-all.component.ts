
import { interval as observableInterval, Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { AdminService, NotificationService, FilesService, AuthenticationService, NonAuthenticationService } from 'app/services';

import { sortByColumn, onChangeTable } from 'app/app.helpers';

import * as _ from 'lodash';

declare const jQuery: any;

interface Column {
  title: string;
  name: string;
  width?: string;
  sort?: 'desc' | 'asc' | false | '';
}

interface Page {
  page: number;
  itemsPerPage: number;
}

@Component({
  selector: 'app-sys-admin-folders-all',
  templateUrl: './sys-admin-folders-all.component.html',
  styleUrls: ['./sys-admin-folders-all.component.scss']
})
export class SysAdminFoldersAllComponent implements OnInit {

  public perPageSelectData: Array<Select2OptionData> = [
    { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
  ];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  listRepos = [];
  pageInfo: { [key: string]: any } = {};
  currentItem: any;
  isOpenModal = {
    delete: false,
    transfer: false,
    share: false,
    create: false,
  };
  currentShareItem = {
    repoID: '',
    name: '',
    encrypted: false,
    owner: '',
  };
  model = {
    name: '',
  };
  userListForShare = [];
  isProcessing = true;
  params: any;
  table: any;
  rows: Array<any> = [];
  columns: Array<any> = [
    {
      title: 'ADMIN.FOLDERS.ALL.TABLE.NAME',
      name: 'name',
      sort: '',
      width: '20%'
    },
    {
      title: 'ADMIN.FOLDERS.ALL.TABLE.FILES',
      name: 'file_count',
      sort: '',
      width: '10%',
      class: 'd-none d-lg-table-cell'
    },
    {
      title: 'ADMIN.FOLDERS.ALL.TABLE.SIZE',
      name: 'size',
      sort: '',
      width: '10%',
      class: 'd-none d-lg-table-cell'
    },
    {
      title: 'ADMIN.FOLDERS.ALL.TABLE.ID',
      name: 'id',
      sort: '',
      width: '20%',
      class: 'd-none d-lg-table-cell'
    },
    {
      title: 'ADMIN.FOLDERS.ALL.TABLE.OWNER',
      name: 'owner',
      sort: '',
      width: '20%',
      class: 'd-none d-lg-table-cell'
    }
  ];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
    className: ['table-hover']
  };
  page: any = {
    page: 1,
    itemsPerPage: 30,
    totalResult: 0,
  };
  maxSize = 5;
  numPages = 1;
  length = 0;
  textAll;
  textSystem;
  textTrash;
  enableViewRepo = false;

  public statusSelectData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  currentUserPermission: any = {
    can_manage_folder: false,
  };

  sortConfig = {
    column: 'name',
    mode: 'asc',
  };
  currentSearchQuery = '';



  isEnabledAdminFolder = false;
  isEnabledAdminArea = false;

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private filesService: FilesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService,
    private translate: TranslateService,
    private authService: AuthenticationService,
    private nonAuthService: NonAuthenticationService
  ) {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminFolder = resp.data.folder_management;
      this.isEnabledAdminArea = resp.data.admin_area;
      if (!this.isEnabledAdminFolder) {
        this.router.navigate(['/error', '404']);
      }
      if (!this.isEnabledAdminArea) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.adminService.getRestapiSettingsByKeys('ENABLE_SYS_ADMIN_VIEW_REPO').subscribe(resp => {
      this.enableViewRepo = resp.data.config_dict.ENABLE_SYS_ADMIN_VIEW_REPO;
    });
  }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;
      this.initData();
      this.loadData();
    });
  }

  initData() {
    this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.ALL').subscribe(all => this.textAll = all);
    this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.SYSTEM').subscribe(system => this.textSystem = system);
    this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.TRASH').subscribe(trash => this.textTrash = trash);
    this.statusSelectData = [
      { id: 'all', text: this.textAll },
      { id: 'system', text: this.textSystem },
      { id: 'trash', text: this.textTrash }
    ];
  }

  async loadData() {
    await this.getListFolders();
    this.handleDataTable();
    const data = onChangeTable(this.config, this.listRepos, this.columns, this.page);
    this.rows = data.rows;
    // this.length = this.listRepos.length;

    this.page.totalResult = this.listRepos.length;
  }

  onSearchFilterChange(data) {
    this.currentSearchQuery = data.target.value.toLowerCase();
    this.page.page = 1;
    if (this.currentSearchQuery !== '') {
      this.handlePagination();
    } else {
      this.getListFolders();
    }
  }

  getListFolders(page: string = '1') {
    return new Promise((resolve) => {
      this.adminService.getListSysAdminFoldersAll('-1', '').subscribe(resps => {
        observableInterval(200).subscribe(() => this.isProcessing = false);
        this.listRepos = resps.data.repos;
        this.pageInfo = resps.data.page_info;
        this.handleSort();
        this.handlePagination();
        resolve();
      });
    });
  }

  handleDataTable() {
    this.listRepos.forEach((element, index) => {
      const customDataRepos = { files_and_size: `${element.file_count} / ${element.size_formatted}` };
      Object.assign(element, customDataRepos);
    });
    this.rows = this.listRepos;
  }

  deleteItemFoldersAll(item: any) {
    this.currentItem = item;
    this.handleOpenModal('delete');
  }

  transferItemFoldersAll(item: any) {
    this.currentItem = item;
    this.handleOpenModal('transfer');
  }

  shareItemFoldersAll(item: any) {
    this.currentItem = item;
    this.handleDataForShareModal();
    this.handleOpenModal('share');
  }

  handleDataForShareModal() {
    const newCurrentShareItem = {
      repoID: this.currentItem.id,
      name: this.currentItem.name,
      encrypted: this.currentItem.encrypted,
      owner: this.currentItem.owner,
    };
    this.currentShareItem = newCurrentShareItem;
  }

  handleOpenModal(typeModal: string) {
    if (typeModal === 'delete') {
      this.isOpenModal.delete = true;
      this.openModal('#modal-folders-all-delete-item', () => this.isOpenModal.delete = false);
    } else if (typeModal === 'transfer') {
      this.isOpenModal.transfer = true;
      this.openModal('#transfer-folder-modal', () => this.isOpenModal.transfer = false);
    } else if (typeModal === 'share') {
      this.isOpenModal.share = true;
      this.openModal('#shares-folders-all-modal', () => this.isOpenModal.share = false);
    } else if (typeModal === 'create') {
      this.isOpenModal.create = true;
      this.openModal('#modal-folders-all-create-new', () => this.isOpenModal.create = false);
    }
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  // START EMIT DATA
  onDeletedReload(messageSuccess: string) {
    this.loadData();
    jQuery('#modal-folders-all-delete-item').modal('hide');
    this.notification.showNotification('success', messageSuccess);
  }

  onTransferedReload(messageSuccess: string) {
    this.loadData();
    jQuery('#transfer-folder-modal').modal('hide');
    this.notification.showNotification('success', messageSuccess);
  }

  onCreatedReload(messageSuccess: string) {
    this.loadData();
    jQuery('#modal-folders-all-create-new').modal('hide');
    this.notification.showNotification('success', messageSuccess);
  }
  // END EMIT DATA

  submitSearch() {
    const owner = this.userListForShare.length > 0 ? this.userListForShare[0].value : '';
    this.adminService.getSearchAllFoldersByNameOrOwner(this.model.name, owner)
      .subscribe(resps => this.listRepos = resps.data.repos);
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.filesService.searchEntries(text, 'user').pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: user.email,
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  searchByOwner(dataItem: any) {
    this.submitSearch();
  }

  removeSearchByOwner(dataItem: any) {
    this.submitSearch();
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.listRepos, this.columns, config, this.page);
    this.rows = data.rows;
    this.page.totalResult = this.listRepos.length;
  }

  changeTable(config, page: Page = this.page) {
    const data = onChangeTable(config, this.listRepos, this.columns, page);
    this.rows = data.rows;
    this.page.totalResult = this.listRepos.length;
  }

  openFolders(data) {
    this.router.navigate(['/admin', 'folders', data.id]);
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.page.page = 1;
    this.rows = onChangeTable(this.config, this.listRepos, this.columns, this.page).rows;
  }

  triggerSort(columnName) {
    if (columnName !== this.sortConfig.column) {
      this.sortConfig.mode = 'asc';
    } else {
      if (this.sortConfig.mode === 'asc') {
        this.sortConfig.mode = 'desc';
      } else {
        this.sortConfig.mode = 'asc';
      }
    }
    this.sortConfig.column = columnName;
    this.handleSort();
  }

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'name':
          this.listRepos = _.orderBy(this.listRepos, ele => ele.name.toLowerCase(), order);
          break;
        case 'owner':
          this.listRepos = _.orderBy(this.listRepos, ele => ele.owner.toLowerCase(), order);
          break;
        case 'file_count':
          this.listRepos = _.orderBy(this.listRepos, ['file_count'], order);
          break;
        case 'id':
          this.listRepos = _.orderBy(this.listRepos, ['id'], order);
          break;
        case 'size':
          this.listRepos = _.orderBy(this.listRepos, ['size'], order);
          break;
      }
      this.handlePagination();
    }
  }

  handlePagination() {
    if (this.page.itemsPerPage <= 0) {
      this.rows = Object.assign([], this.listRepos);
      this.page.totalResult = this.listRepos.length;
    } else {
      const start = (this.page.page - 1) * this.page.itemsPerPage;
      const end = start + this.page.itemsPerPage;
      if (this.currentSearchQuery !== '') {
        const result = this.listRepos.filter(ele => {
          const searchForFolderName = ele.name.toLowerCase().includes(this.currentSearchQuery);
          const searchForFolderID = ele.id.includes(this.currentSearchQuery);
          const searchForUsername = ele.owner.toLowerCase().includes(this.currentSearchQuery);
          if (searchForFolderName) {
            return searchForFolderName;
          } else if (searchForFolderID) {
            return searchForFolderID;
          } else if (searchForUsername) {
            return searchForUsername;
          }
        });
        this.rows = result.slice(start, end);
        this.page.totalResult = result.length;
      } else {
        this.rows = this.listRepos.slice(start, end);
        this.page.totalResult = this.listRepos.length;
      }
    }
  }
}
