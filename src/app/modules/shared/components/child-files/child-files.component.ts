import { Component, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';

import { setTimeout } from 'core-js/library/web/timers';
import { AppConfig } from 'app/app.config';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import { Action, Type } from '@enum/index.enum';
import {
  FilesService,
  NotificationService,
  GroupsService,
  MessageService,
  I18nService,
  TitleService,
  AdminService,
    SearchService
} from '@services/index';
import { saveAs } from "file-saver";

// components
import { ChildFileCreateNewModalComponent } from '../child-file-create-new-modal/child-file-create-new-modal.component';
import { PasswordFolderModalComponent } from '../password-folder-modal/password-folder-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { ChildListViewComponent } from '@modules/shared/components/child-list-view/child-list-view.component';
import { Select2OptionData } from 'ng2-select2';
import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { ChildGridViewComponent } from '@modules/shared/components/child-grid-view/child-grid-view.component';


declare const jQuery: any;
declare const Dropzone: any;

@Component({
  selector: 'app-child-files',
  templateUrl: './child-files.component.html',
  styleUrls: ['./child-files.component.scss'],
})
export class ChildFilesComponent implements OnInit, OnDestroy {
  private subcriptionUpload: Subscription = new Subscription();

  @ViewChild(ChildFileCreateNewModalComponent) private createNewChildFileModal: ChildFileCreateNewModalComponent;
  @ViewChild(PasswordFolderModalComponent) private passwordFolderModal: PasswordFolderModalComponent;
  @ViewChild(ChildListViewComponent) private childListViewComponent: ChildListViewComponent;
  @ViewChild(ChildGridViewComponent) private childGridViewComponent: ChildGridViewComponent;
  @ViewChild('inputSearch') private inputSearchElement;
  @ViewChild('searchEle') private searchEle;

  repoId;
  parentPath;
  paths = [];
  pathRouteSystem: string[] = [];
  listFiles = [];
  originalListFiles = [];
  nameFolderFormControl;
  createType;
  nameFolderRegex = /^[^~#%*/\\:<>?|"]*$/;
  // nameFileRegex = /^[^(/\\?*"|)]*\.*[A-Za-z0-9]{2,4}$/;
  beginNameFileRegex = /^[^._]+/;
  nameFileRegex = /^[^~#%*/\\:<>?|"]*$/;
  endNameFileRegex = /[^.]+$/;
  isShowCreateNewFile = false;
  isListView = this.cookieService.get('syc_view_mode') === 'list_view' ? true : false;
  isRootView = false;
  currentData;
  currentIndex;
  repoName = '';
  repoPermission = '';
  repoEncrypted = false;
  repoOwner = '';
  checkFolderFavorite = false;
  breadcrumbs: any = {
    paths: ''
  };
  dir_permission: string;
  sharePermissions: any = {};
  tail;
  typeRepo = '';
  currentShareItem = {
    repoID: '',
    path: '',
    type: '',
    name: '',
    encrypted: false,
    permission: '',
    owner: '',
  };
  listChecked = [];
  typeCopyMove: string;
  isOpenChildFilesModal = {
    'create': false,
    'share': false,
    'delete': false,
    'detail': false,
    'upload': false,
    'copy_move': false,
  };
  isCheckedAll = false;
  isDropzoneShow = false;
  hasHistoryView = false;
  rangeSizeGrid;
  getDirentListInterval;
  listType = '';
  whos = '';
  validLib = true;
  invalidLibMessage = '';
  idGroup: number | string;
  params: any;
  isEncrypt = false;
  // dropzonePostUrl = 'dropzonePostUrl';
  listChildFileDisplay: Array<any> = [];
  columns: Array<any> = [
    { title: 'TABLE.COLUMNS.NAME', name: 'name', width: '40%', is_default: true },
    { title: 'TABLE.COLUMNS.UPDATED', name: 'mtime', width: '12%', is_filter: false, class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.SIZE', name: 'size', width: '7%', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.MODIFIER', name: 'modifier_name', width: '15%', is_filter: false, class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.PERMISSIONS', name: 'permission', width: '10%', is_filter: false, class: 'd-none d-lg-table-cell' }
    // 25,18,10,10,10
  ];
  defaultColums = [];
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
  isInitSubscribe = false;
  isProcessing = true;
  arrPathNotRepoID = [];
  titlePage: string;
  countCheckedItem: number;
  titleReplaceFinal = '';
  allowToViewHistory = false;
  allowToViewSnapshot = false;
  allowRestoreSnapshot = false;
  // Added By Ibrahim E.Gad for batch download
  allowFoldersInBatch = 1;
  batchMaxFilesCount = 50;
  hasFolderSelected = false;
  constructor(
      private adminService: AdminService,
      private filesService: FilesService,
      private appConfig: AppConfig,
      private noti: NotificationService,
      private cookieService: CookieService,
      private router: Router,
      private messageService: MessageService,
      private activatedRoute: ActivatedRoute,
      private groupsService: GroupsService,
      private i18nService: I18nService,
      private translate: TranslateService,
      private renderer: Renderer2,
      private titleService: TitleService,
      private searchService: SearchService
  ) {
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
    this.activatedRoute.url.subscribe(params => {
      this.handlePathsFromURL();
      this.config.filtering = { filterString: '' };
      this.pathRouteSystem = params.map(data => data.path)
    });
  }

  ngOnInit() {
    this.defaultColums = Object.assign([], this.columns);
    this.subscribe();
    this.initValueNameValidate();
  }

  subscribe() {
    const foo = this.messageService.subscribe(Type.Upload_Process_Popup, (payload) => {
      switch (payload.action) {
        case 'upload-complete':
          this.filesService.getItemInFolder(this.repoId, this.parentPath).subscribe(
              resp => {
                if (this.listFiles.length !== resp.data.dirent_list.length) {
                  this.handleBredcrumbs(resp.data.repo_name);
                  this.listFiles = resp.data.dirent_list;
                  this.originalListFiles = this.listFiles;
                  this.dir_permission = resp.data.dir_perm;
                  this.repoName = resp.data.repo_name;
                  this.repoPermission = resp.data.permission;
                  this.repoEncrypted = resp.data.encrypted;
                  this.repoOwner = resp.data.owner;
                  this.columns = Object.assign(this.defaultColums);
                  this.sharePermissions = resp.data.user_permission;
                  this.changeTable(this.config);
                }
              }, error => {
                // this.noti.showNotification('danger', JSON.parse(error._body).message);
              });
          break;
        default:
          break;
      }
    });
    this.subcriptionUpload.add(foo);
    this.adminService.getSettingsByKeys('ALLOW_FOLDERS_IN_BATCH,BATCH_MAX_FILES_COUNT').subscribe(
        resp => {
          console.log(resp);
          this.allowFoldersInBatch = resp.data.config_dict['ALLOW_FOLDERS_IN_BATCH'];
          this.batchMaxFilesCount = resp.data.config_dict['BATCH_MAX_FILES_COUNT'];
        }
    );
  }

  ngOnDestroy() {
    this.subcriptionUpload.unsubscribe();
  }

  async handlePathsFromURL() {
    const pathArr = this.router.url.split('/');
    const handleUrl = [];
    pathArr.forEach(e => {
      handleUrl.push(e.replace(/%25/g, ''));
      // handleUrl.push(e);
    });

    this.typeRepo = getTypeRepoFromRoute(handleUrl);
    this.typeRepo.includes('group--') ? this.handleDataPathsGroup(handleUrl) : this.handleDataPathsOther(handleUrl);
    this.getListType();
    await this.loadListChildFile();
    if (this.isListView && this.childListViewComponent) {
      this.childListViewComponent.isSingleClick = false;
    } else if (!this.isListView && this.childGridViewComponent) {
      this.childGridViewComponent.isSingleClick = false;
    }
    this.historyView();
  }

  filterPathGroup(pathArr: any[]) {
    const paths = pathArr
        .filter(data => (data.length > 0))
        .filter(data => data !== 'groups')
        .filter(data => data !== 'files');
    this.idGroup = paths[0];
    this.paths = paths.filter((_, index) => index !== 0);
  }

  handleDataPathsOther(pathArr: any[]) {
    this.paths = pathArr
        .filter(data => (data.length > 0))
        .filter(data => data !== 'folders')
        .filter(data => data !== 'shared-files')
        .filter(data => data !== 'org')
        .filter(data => data !== 'files')
        .filter(data => data !== 'shared-groups')
        .filter(data => data !== 'folders');
    this.handlePaths();
  }

  handleDataPathsGroup(pathArr: any[]) {
    const paths = pathArr
        .filter(data => (data.length > 0))
        .filter(data => data !== 'groups')
        .filter(data => data !== 'files')
        .filter(data => data !== 'folders');
    this.idGroup = paths[0];
    this.paths = paths.filter((_, index) => index !== 0);
    this.handlePaths();
  }

  handlePaths() {
    if (this.paths.length > 0) {
      this.repoId = this.paths[0];
      this.arrPathNotRepoID = this.paths.filter((_, index) => index !== 0);
      this.parentPath = this.arrPathNotRepoID.length === 0 ? '/' : decodeURIComponent('/' + this.arrPathNotRepoID.join('/'));
    }
  }

  getListType() {
    const route = this.router.url.split('/');
    this.whos = this.typeRepo.includes('mine') ? 'Your' : 'This';
    this.listType = route.length === (this.typeRepo.includes('group--') ? 5 : 4) ? 'folder' : 'subfolder';
  }

  async loadListChildFile() {
    await this.getFilesInFolder();
    this.titlePage = this.arrPathNotRepoID.length === 0
        ? this.repoName
        : decodeURI(this.arrPathNotRepoID.filter((_, index, arr) => index === arr.length - 1).toString());
    this.changeTable(this.config);
    this.isProcessing = false;
    this.replaceTitle();

  }

  replaceTitle() {
    const titleReplace = this.titlePage.replace(/%28/g, '(');
    this.titleReplaceFinal = titleReplace.replace(/%29/g, ')');
    this.titleService.setTitle(
        [
          {
            str: this.titleReplaceFinal,
            translate: false
          }
        ]);
  }

  initValueNameValidate() {
    if (this.createType === 'Folder') {
      this.nameFolderFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(this.nameFolderRegex),
      ]);
    } else {
      this.nameFolderFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(this.beginNameFileRegex),
        Validators.pattern(this.nameFileRegex),
        Validators.pattern(this.endNameFileRegex),
      ]);
    }
  }


  getFilesInFolder(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.validLib = true;
      this.invalidLibMessage = '';
      this.filesService.getItemInFolder(this.repoId, this.parentPath).subscribe(
          resps => {
            if (resps.data.allow_view_history === true) {
              this.allowToViewHistory = true;
            }
            if (resps.data.allow_restore_snapshot === true) {
              this.allowRestoreSnapshot = true;
            }
            if (resps.data.allow_view_snapshot === true) {
              this.allowToViewSnapshot = true;
            }

            this.hanldeGetFilesSuccess(resps);
            resolve();
          },
          error => {
            this.validLib = false;
            // try {
            //   this.invalidLibMessage = JSON.parse(error._body).message;
            // } catch (e) {
            //   this.router.navigate(['/error', '404']);
            //   console.error(e);
            //   this.invalidLibMessage = 'Folder not found';
            // }
            this.router.navigate(['/error', '404']);
            resolve();
          });
    });
  }


  hanldeGetFilesSuccess(resps: any) {
    if (resps.data.lib_need_decrypt) {
      this.isEncrypt = true;
      this.validLib = false;
      this.invalidLibMessage = resps.message;
      this.repoName = resps.data.repo_name;
      this.openPasswordFolderModal();
    } else {
      const direntList = resps.data.dirent_list;
      this.listFiles = direntList;
      this.originalListFiles = this.listFiles;
      this.dir_permission = resps.data.dir_perm;
      this.repoName = resps.data.repo_name;
      this.repoPermission = resps.data.permission;
      this.repoEncrypted = resps.data.encrypted;
      this.repoOwner = resps.data.owner;
      this.handleBredcrumbs(resps.data.repo_name);
    }
  }

  async handleBredcrumbs(repoName) {
    if (this.typeRepo.includes('group--')) {
      this.groupsService.getGroupInfo(this.idGroup).subscribe(
          resps => this.getPathsBreadcrumbs(['My Groups', resps.data.name, repoName]),
          error => this.getPathsBreadcrumbs(['My Groups', this.idGroup, repoName]));
    } else {
      const rootName = await this.getRootName();
      this.getPathsBreadcrumbs([rootName, repoName]);
    }
  }

  getRootName(): Promise<any> {
    return new Promise((resolve) => this.translate.get('BREADCRUMBS.FILES').subscribe(data => resolve(data)));
  }

  getPathsBreadcrumbs(pathArrParent: any[]) {
    this.paths.forEach((value, index) => index !== 0 ? pathArrParent.push(this.renderName(value)) : null);
    this.breadcrumbs = { paths: '/' + pathArrParent.join('/') + '/' };
  }

  receiveDataNavigateBreadcrumbs(data) {
    const dataPSplit = data.p.split('/').filter((_, index) => index !== 0);
    if (this.typeRepo.includes('group--')) {
      if (data.p === '/') {
        this.router.navigate(['manage', 'groups']);
      } else {
        if (dataPSplit.length === 1) {
          this.router.navigate(['manage', 'groups', this.idGroup, 'group-management']);
        } else if (dataPSplit.length === 2) {
          this.router.navigate(['groups', this.idGroup, 'folders', this.repoId]);
        } else {
          const pathChildrenGroup = dataPSplit.filter((_, index) => index !== 0 && index !== 1);
          this.router.navigate(['groups', this.idGroup, 'folders', this.repoId, ...pathChildrenGroup]);
        }
      }
      const handleData = data.p.split('/').filter((_, index) => index !== 0 && index !== 1);
    } else {
      // const type = this.typeRepo === 'mine' ? '' : 'shared-files';
      // console.log('this is type', type);
      const handleData = data.p.split('/').filter((_, index) => index !== 0 && index !== 1);
      data.p === '/' ? this.router.navigate(['folders']) : this.router.navigate(['folders', this.repoId, ...handleData]);
    }
  }

  renderName(value) {
    return decodeURI(value);
  }

  openModalCreate(type) {
    this.createType = type;
    this.initValueNameValidate();
    this.handleCreateType(type);
    jQuery('#modal-create-child-file').modal('show');
    this.createNewChildFileModal.handleAutoFocus();
  }

  handleCreateType(type) {
    let tail = '';
    switch (type) {
      case 'Markdown': tail = '.md'; break;
      case 'Excel': tail = '.xlsx'; break;
      case 'PowerPoint': tail = '.pptx'; break;
      case 'Word': tail = '.docx'; break;
      case 'Html': tail = '.html'; break;
      default: break;
    }
    this.tail = tail;
    this.nameFolderFormControl.setValue(tail);
  }

  openUpload() {
    this.handleOpenModal('upload');
  }

  modalAction(data) {
    this.currentData = data.data;
    this.currentIndex = data.index;
    this.handleOpenModal(data.action);
    switch (data.action) {
      case 'copy': this.typeCopyMove = 'copy'; break;
      case 'move': this.typeCopyMove = 'move'; break;
      default: break;
    }

    const newCurrentShareItem = {
      repoID: this.repoId,
      path: '/',
      type: data.data.type,
      name: data.data.name,
      encrypted: false,
      permission: data.data.permission,
      owner: this.repoOwner
    };

    // Populate the path
    const sharePath = this.paths.length > 1 ? `/${decodeURIComponent(this.paths.slice(1).join('/'))}` : '';
    newCurrentShareItem.path = `${sharePath}/${newCurrentShareItem.name}`;
    this.currentShareItem = newCurrentShareItem;
  }

  handleOpenModal(typeModal: string) {
    const isOpen = this.isOpenChildFilesModal;
    return new Promise((resolve, reject) => {
      try {
        if ((typeModal === 'copy') || (typeModal === 'move')) {
          isOpen.copy_move = true;
          this.openModal('#copy-move-modal', () => isOpen.copy_move = false);
        } else if (typeModal === 'delete') {
          isOpen.delete = true;
          this.openModal('#delete-file-modal', () => isOpen.delete = false);
        } else if (typeModal === 'share') {
          isOpen.share = true;
          this.openModal('#share-modal', () => isOpen.share = false);
        } else if (typeModal === 'viewDetails') {
          isOpen.detail = true;
          this.openModal('#details-modal', () => isOpen.detail = false);
        } else if (typeModal === 'upload') {
          isOpen.upload = true;
          this.openModal('#upload-child-file-modal', () => isOpen.upload = false);
        }
      } catch (e) { reject(e); }
    });
  }

  openModal(idModal: string, destroyModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', destroyModal).modal('show'));
  }

  getNewCurrentShareItem() {
    if (this.paths.length <= 1) {
      return {
        repoID: this.repoId,
        path: '/',
        type: 'repo',
        name: this.repoName,
        encrypted: this.repoEncrypted,
        permission: this.repoPermission,
        owner: this.repoOwner
      };
    } else {
      const tmpPath = this.paths.slice(1);
      const sharePath = `/${decodeURIComponent(tmpPath.join('/'))}`;
      return {
        repoID: this.repoId,
        path: `/${decodeURIComponent(this.paths.slice(1).join('/'))}`,
        type: 'dir',
        name: decodeURIComponent(tmpPath[tmpPath.length - 1]),
        encrypted: false,
        permission: this.dir_permission,
        owner: this.repoOwner
      };
    }
  }

  shareFolder(data) {
    this.currentShareItem = this.getNewCurrentShareItem();
    let name_share;
    for (const ele of data) {
      if (ele === data[data.length - 1]) {
        name_share = { name: this.renderName(ele) };
      }
    }
    this.handleOpenModal('share');
    this.messageService.send(Type.Password_Protect_Component, Action.Open_Child_File, '');
  }

  trash() {
    const queryParams = { 'path': this.parentPath };
    this.router.navigate(['files', 'trash', this.repoId], { queryParams: this.parentPath !== '/' ? queryParams : null });
  }

  history() {
    if (this.allowToViewHistory) {
      this.router.navigate(['files', 'history'], {
        queryParams: { path: this.repoId + this.parentPath }
      });
    } else {
      this.router.navigate(['error', '404']);
    }
  }

  onCopyMovedSuccess() {
    this.resetListChecked();
    this.loadListChildFile();
    jQuery('#copy-move-modal').modal('hide');
  }

  handleInfoChecked(listCheckedItem: Array<any>) {
    const folders = listCheckedItem.filter(row => row.type === 'dir');
    this.hasFolderSelected = folders.length > 0;
    this.countChecked();
    this.listChecked = listCheckedItem;
    const listDirMarkFvLength = listCheckedItem.filter(ele => ele.type === 'dir').length;
    if (listDirMarkFvLength > 0) {
      this.checkFolderFavorite = true;
    } else {
      this.checkFolderFavorite = false;
    }
  }

  getListChecked(listData: Array<any>) {
    this.listChecked = listData.filter(ele => ele.isChecked);
  }

  downloadChecked() {
    if (this.listChecked.length === 1 && this.listChecked[0].type === 'file') {
      this.handleDownloadCheckedOneFile();
    } else {
      this.handleDownloadCheckedMulti();
    }
  }
  batchDownloadChecked() {
    if (this.hasFolderSelected && '' + this.allowFoldersInBatch !== '1') {
      this.noti.showNotification('danger', this.translate.instant( 'FILE_BROWSER.FOLDER_NOT_ALLOWED_IN_BATCH'));
      return false;
    }
    if (this.hasFolderSelected) {
      // Here we should check if number of all files including files in folders is less than batchMaxFilesCount, but we
      // will leave that to be done server-side as a part of creating the links
      this.handleBatchDownload();
      return false;
    }
    if (this.listChecked.length > this.batchMaxFilesCount) {
      this.noti.showNotification('danger', this.translate.instant('FILE_BROWSER.MAX_FOLDERS_ALLOWED_IN_BATCH') + this.batchMaxFilesCount);
      return false;
    }
    this.handleBatchDownload();
  }
  handleBatchDownload() {
    const dirents = this.listChecked.map(ele => ele.name).join('&dirents=');
    this.filesService.getDownloadLinks(this.repoId, this.parentPath, dirents)
        .subscribe(resps => {
          console.log(resps.data.urls.length);
          for (let i = 0; i < resps.data.urls.length; i++ ) {
            const url = resps.data.urls[i];
            let ng = this;
            this.filesService.getFile(url).subscribe(data => {
              saveAs(data, decodeURI(url).split('/').pop());
            });
          }
          return false;
          // this.resetListChecked();
        }, error => {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
          console.error(error);
        });
  }
  handleDownloadCheckedOneFile() {
    this.filesService.getDownloadLink(this.repoId, this.parentPath + '/' + this.listChecked[0].name)
        .subscribe(resps => {
          window.location.href = resps.data.dl_url;
          // this.resetListChecked();
        }, error => {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
          console.error(error);
        });
  }

  handleDownloadCheckedMulti() {
    const dirents = this.listChecked.map(ele => ele.name).join('&dirents=');
    this.filesService.zipFolder(this.repoId, this.parentPath, dirents)
        .subscribe(resps => {
          this.messageService.send(Type.Zip_Progress_Modal, 'zip-start', resps.data);
          // this.resetListChecked();
        }, error => {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
          console.error(error);
        });
  }

  deleteChecked() {
    const listNameChecked = this.listChecked.map(ele => ele.name);
    this.filesService.deleteMultiFilesDirs(this.repoId, this.parentPath, listNameChecked)
        .subscribe(resps => {
          this.loadListChildFile();
          if (this.isListView) {
            this.childListViewComponent.uncheckAll();
          }
          this.noti.showNotification('success', resps.message);
        }, error => {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
          console.error(error);
        });
  }

  batchMarkFileStarred() {
    console.log(this.listChecked);
    const listFileToMarkFav = this.listChecked.filter(ele => ele.type === 'file');
    if (listFileToMarkFav.length === 0) {
      this.noti.showNotification('danger', this.translate.instant('FILE_BROWSER.BATCH_MARKED_FAVORITE_AT_LEAST_ONE_FILE'));
      return;
    }
    for (const item of this.listChecked) {
      if (item.type === 'file') {
        this.filesService.markedFileStarred(this.repoId, this.pathForStarred(item.name)).subscribe(resp => {
          item.starred = true;
          if (listFileToMarkFav.indexOf(item) === listFileToMarkFav.length - 1) {
            this.noti.showNotification('success', this.translate.instant('FILE_BROWSER.BATCH_MARKED_FAVORITE_SUCCESS'));
            if (this.isListView) {
              this.childListViewComponent.uncheckAll();
            } else {
              this.uncheckAll();
            }
          }
        });
      }
    }
  }

  pathForStarred(filename) {
    let paths = '/';
    if (this.paths.length > 1) {
      paths += this.pathRouteSystem.slice(1).join('/');
      paths += '/';
    }
    return paths + filename;
  }

  copyMoveChecked(type: string) {
    this.typeCopyMove = type;
    this.handleOpenModal(type);
    this.currentData = this.listChecked;
  }

  historyView() {
    this.hasHistoryView = this.paths.length === 1;
  }

  onfileDrop(data) {
    this.isDropzoneShow = false;
    if (data.files.length === 0) { return; }
    this.messageService.send(Type.Upload_Process_Popup, 'show', {
      uploadFileList: data,
      repoIDForUpload: this.repoId,
      pathForUpload: this.parentPath,
      type: 'file-drop'
    });
  }

  openPasswordFolderModal() {
    jQuery('#password-folder-modal').modal('show');
  }

  openEncryptedFolderCallBack(repoId) {
    this.isEncrypt = false;
    this.loadListChildFile();
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
    if (this.isListView) {
      if (this.listChecked.length === this.listChildFileDisplay.length) {
        setTimeout(() => this.childListViewComponent.checkAll());
      }
    }
  }

  onDragEnter() {
    if (this.isOpenChildFilesModal.upload !== true) {
      this.isDropzoneShow = this.dir_permission === 'rw' ? true : false;
      window.scrollTo(0, 0);
    }
  }

  changeTable(config, page = this.page) {
    let p = this;
    console.log(config.filtering.filterString);
    if (config.filtering && config.filtering.filterString && config.filtering.filterString.length > 3){
      this.searchService.searchInFolder(this.repoId, this.parentPath, config.filtering.filterString).subscribe(
          resps => {
           console.log(resps);
          p.listFiles = resps.data.data;
              const data = onChangeTable(config, p.listFiles, p.columns, page, true);
    p.listChildFileDisplay = data.rows;
    p.length = data.length;
    p.countChecked();
          },
          error => {
           console.log("ERROR");
          });
      }
    else {
      this.listFiles = this.originalListFiles;
                    const data = onChangeTable(config, this.listFiles, this.columns, page, true);
    this.listChildFileDisplay = data.rows;
    this.length = data.length;
    this.countChecked();
    }
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.page.page = 1; // Reset to page 1
    this.changeTable(this.config);
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.listFiles, this.columns, config, this.page, true);
    this.listChildFileDisplay = data.rows;
    this.length = data.length;
  }

  checkAll() {
    this.isListView ? this.childListViewComponent.checkAll() : this.childGridViewComponent.checkAll();
  }

  uncheckAll() {
    this.isListView ? this.childListViewComponent.uncheckAll() : this.childGridViewComponent.uncheckAll();
  }

  countChecked(listData: Array<any> = this.listChildFileDisplay) {
    this.getListChecked(listData);
    this.countCheckedItem = this.listChecked.length;
  }

  resetListChecked() {
    this.listChildFileDisplay.map(ele => ele.isChecked = false);
    this.countCheckedItem = 0;
  }

  goBack() {
    this.paths.pop();

    if (this.typeRepo.includes('group--')) {
      const groupId = this.typeRepo.split('--')[1];
      if (this.paths.length > 0) {
        this.router.navigate(['groups', groupId, 'folders', ...this.paths]);
      } else {
        this.router.navigate(['groups', groupId, 'folders']);
      }
    } else {
      if (this.paths.length > 0) {
        this.router.navigate(['folders', ...this.paths]);
      } else {
        this.router.navigate(['folders']);
      }
    }
  }
}
