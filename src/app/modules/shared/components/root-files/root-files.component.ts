import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie';
import { SubscriptionLike as ISubscription } from 'rxjs';

import { AppConfig } from 'app/app.config';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import { FoldersModel } from 'app/Models/Folder.model';
import { Action, Type } from '@enum/index.enum';
import { AuthenticationService, NonAuthenticationService, FilesService, MessageService, NotificationService, I18nService } from '@services/index';

// components
import { TranslateService } from '@ngx-translate/core';
import { sortByColumn, onChangeTable } from 'app/app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-root-files',
  templateUrl: './root-files.component.html',
  styleUrls: ['./root-files.component.scss']
})
export class RootFilesComponent implements OnInit, OnDestroy {

  private subscription: ISubscription;

  @ViewChild('inputSearch') private inputSearchElement;

  isProcessing = true;
  // Variable
  isSelectOtherTab = false;
  isListView = this.cookieService.get('syc_view_mode') === 'list_view' ? true : false;
  currentFolder: FoldersModel;
  currentIndex;
  folders = [];
  folders2 = [];
  type = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
  breadcrumbs: string;
  currentShareItem = {
    repoID: '',
    path: '',
    type: '',
    name: '',
    encrypted: false,
    permission: '',
  };
  getCookieSortMode = this.cookieService.get('syc_sort_mode');
  typeModal: string;
  isOpenModalFolder = {
    'create_folder': false,
    'delete': false,
    'detail': false,
    'share': false,
    'transfer': false,
    'history_setting': false,
    'change_password': false,
    'view_share_link': false,
    'share_existing_folders': false,
  };
  typeSort: string;
  messageTitle: string;
  messageTitleFolderNotFound: string;
  messageSub: string;
  messageSubFolderNotFound: string;
  params: any;
  getError = {
    is_err: false,
    msg_err: ''
  };
  listFoldersDisplay2: Array<any> = [];
  columns = [
    { title: 'TABLE.COLUMNS.NAME', name: 'name' },
    { title: 'TABLE.COLUMNS.UPDATED', name: 'mtime', is_filter: false, class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.SIZE', name: 'size', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.OWNER', name: 'owner_edited', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.PERMISSIONS', name: 'permission', is_filter: false, class: 'd-none d-lg-table-cell' }
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
  loginData;
  rangeSizeGrid;

  currentUserPermission: any = {
    can_add_repo: false
  };

  isEnabledFolderManager = false;


  constructor(
    private authenticationService: AuthenticationService,
    private nonAuthService: NonAuthenticationService,
    private filesService: FilesService,
    private appConfig: AppConfig,
    private notify: NotificationService,
    private cookieService: CookieService,
    private router: Router,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService,
    private translate: TranslateService,
    private location: Location
  ) {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFolderManager = resp.data.folder_management;
      if (!this.isEnabledFolderManager) {
        this.router.navigate(['/error', '404']);
      }
    });
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
    this.messageTitle = this.translate.instant('FOLDERS.NO_FILTER_RESULT_TITLE');
    this.messageSub = this.translate.instant('FOLDERS.NO_FILTER_RESULT_SUB');
    this.messageTitleFolderNotFound = this.translate.instant('FOLDERS.NO_FOLDER_ADDED');
    this.messageSubFolderNotFound = this.translate.instant('FOLDERS.NO_FOLDER_SUB_ADDED');
  }

  ngOnInit() {
    this.authenticationService.userInfo().subscribe(resp => {
      console.log(resp);
      this.currentUserPermission = resp.data.permissions;
    });
    // this.nonAuthService.getAvailableFeatures().subscribe(featureResp => {
    //   console.log(featureResp);
    //   if (!featureResp.data.config_dict.ENABLE_FILE_PREVIEW) {
    //     this.router.navigate(['/error', '404']);
    //   }
    // });
    this.getCheckLogin();
    this.loadListRepos();
    this.subscribe();
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Root_Files_Componenet, (payload) => {
      switch (payload.action) {
        case Action.Reload:
          this.loadListRepos();
          break;
        default: break;
      }
    });
  }

  unsubscribe() {
    this.subscription.unsubscribe();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  getCheckLogin() {
    this.authenticationService.checkLogin().subscribe(resps => this.loginData = resps.data);
  }

  modalAction(data) {
    this.currentFolder = data.folder;
    this.currentIndex = data.index;
    this.typeModal = data.action;
    this.handleOpenModal(data.action);
    const newCurrentShareItem = {
      repoID: data.folder.id,
      path: '/',
      type: data.folder.type,
      name: data.folder.name,
      encrypted: data.folder.encrypted,
      permission: data.folder.permission,
      owner: data.folder.owner
    };
    this.currentShareItem = newCurrentShareItem;
  }

  handleOpenModal(type: string) {
    const isOpen = this.isOpenModalFolder;
    return new Promise((resolve, reject) => {
      try {
        if (type === 'transferFolder') {
          this.isOpenModalFolder.transfer = true;
          this.openModal('#transfer-folder-modal', () => isOpen.transfer = false);
        } else if (type === 'delete') {
          this.isOpenModalFolder.delete = true;
          this.openModal('#delete-file-modal', () => isOpen.delete = false);
        } else if (type === 'shared') {
          this.isOpenModalFolder.share = true;
          this.openModal('#share-modal', () => isOpen.share = false);
        } else if (type === 'viewDetails') {
          this.isOpenModalFolder.detail = true;
          this.openModal('#details-modal', () => isOpen.detail = false);
        } else if (type === 'historySetting') {
          this.isOpenModalFolder.history_setting = true;
          this.openModal('#history-setting-modal', () => isOpen.history_setting = false);
        } else if (type === 'changePassword') {
          this.isOpenModalFolder.change_password = true;
          this.openModal('#change-password-folder-modal', () => isOpen.change_password = false);
        } else if (type === 'viewShareLink') {
          this.isOpenModalFolder.view_share_link = true;
          this.openModal('#share-link-modal', () => isOpen.view_share_link = false);
        } else if (type === 'createFolder') {
          this.isOpenModalFolder.create_folder = true;
          this.openModal('#modal-create-folder', () => isOpen.create_folder = false);
        } else if (type === 'share-existing-folders') {
          this.isOpenModalFolder.share_existing_folders = true;
          this.openModal('#share-existing-folders-modal', () => isOpen.share_existing_folders = false);
        }
      } catch (e) {
        console.error('error: ', e);
        reject(e);
      }
    });
  }

  openModal(idModal: string, detroyModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', detroyModal).modal('show'));
  }

  viewDeletedFolders() {
    this.router.navigate(['files', 'deleted-folders']);
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.folders2, this.columns, config, this.page);
    this.listFoldersDisplay2 = data.rows;
    this.length = data.length;
  }

  async loadListRepos() {
    await this.getReposAll();
    await this.handleDataListRepos();
    if (this.isOpenModalFolder.create_folder === false) {
      if (this.listFoldersDisplay2.length === 1) {
        if (this.page.page === 1) {
          this.page.page = 1;
        } else {
          this.page.page = this.page.page - 1;
        }
      }
    }
    const data = onChangeTable(this.config, this.folders2, this.columns, this.page);
    this.listFoldersDisplay2 = data.rows;
    this.length = data.length;
  }

  getReposAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.filesService.getReposAll().subscribe(resps => {
        this.folders2 = resps.data;
        this.isProcessing = false;
        resolve();
      });
    });
  }

  handleDataListRepos(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.folders2.forEach((element) => {
        if (element.type === 'repo') {
          element.owner_edited = this.translate.instant('LABELS.MINE');
        } else if (element.type === 'srepo' && element.share_type === 'personal') {
          element.owner_edited = element.owner;
        } else if (element.type === 'grepo' && element.share_type === 'public') {
          element.owner_edited = `All Users - ${element.share_from}`;
        } else if (element.type === 'grepo' && element.groupid) {
          element.owner_edited = `Group - ${element.owner}`;
        }
      });
      resolve();
    });
  }

  changeTable(config, page = this.page) {

    const data = onChangeTable(config, this.folders2, this.columns, page);
    this.listFoldersDisplay2 = data.rows;
    this.length = data.length;
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadListRepos();
  }

  onTranferReload(messageSuccess: string) {
    this.loadListRepos();
    jQuery('#transfer-folder-modal').modal('hide');
    this.notify.showNotification('success', messageSuccess);
  }

  onOpenSearchBar() {
    const elmSearch = document.getElementsByClassName(`search__bar`);
    const getStyleOfElm = elmSearch[0].getAttribute('style');
    if (getStyleOfElm !== `display: block`) {
      elmSearch[0].setAttribute(`style`, `display: block`);
    } else {
      elmSearch[0].setAttribute(`style`, `display: none`);
    }
  }

}
