import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, NotificationService, FilesService, TitleService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { Select2OptionData } from 'ng2-select2';

import { AdminCreateChildFileModalComponent } from '../admin-create-child-file-modal/admin-create-child-file-modal.component';
import { AdminDeleteModalComponent } from '../admin-delete-modal/admin-delete-modal.component';



declare const jQuery: any;

@Component({
  selector: 'app-child-folders-all',
  templateUrl: './child-folders-all.component.html',
  styleUrls: ['./child-folders-all.component.scss']
})
export class ChildFoldersAllComponent implements OnInit {

  @ViewChild(AdminCreateChildFileModalComponent) private createNewChildFileModal: AdminCreateChildFileModalComponent;

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

  repoID: string;
  pathArr: Array<any> = [];
  path: string;
  childFoldersData: any;
  listChildFoldersDisplay: Array<any> = [];
  isEncrypt: boolean;

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];


  columns: Array<any> = [
    {
      title: 'TABLE.COLUMNS.NAME',
      name: 'name',
      width: '30%'
    },
    {
      title: 'TABLE.COLUMNS.SIZE',
      name: 'size',
      width: '15%',
      class: 'd-none d-lg-table-cell'
    },
    {
      title: 'TABLE.COLUMNS.LAST_UPDATE',
      name: 'mtime',
      width: '15%',
      class: 'd-none d-lg-table-cell'
    }
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
  params: any;
  breadcrumbs = [];
  getErr = false;
  errMsg: string;
  currentFolderName = '';
  parentPath = '';
  isProcessing = true;

  nameFolderFormControl;
  createType;
  nameFolderRegex = /^[^~#%&*/\\:<>?+|".]*$/;
  beginNameFileRegex = /^[^._]+/;
  nameFileRegex = /^[^~#%&*/\\:<>?+|"]*$/;
  endNameFileRegex = /[^.]+$/;
  tail;
  getNameOfFolder;
  currentData;

  constructor(
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private translate: TranslateService,
    private notify: NotificationService,
    private filesService: FilesService,
    private modalService: BsModalService,
    private titleService: TitleService
  ) {
    this.adminService.getRestapiSettingsByKeys('ENABLE_SYS_ADMIN_VIEW_REPO').subscribe(
      (resps) => {
        if (!resps.data.config_dict.ENABLE_SYS_ADMIN_VIEW_REPO) {
          this.router.navigate(['/error', '404']);
        } else {
          this.activatedRoute.url.subscribe(segments => {
            this.repoID = segments[0].path;
            this.pathArr = [];
            (segments.filter((_, index) => index !== 0)).forEach((value) => this.pathArr.push(value.path));
            this.config.filtering.filterString = '';
            this.handlePath();
            this.loadData();
            this.getParentPath();
          });
        }
      }
    );
  }

  ngOnInit() {
  }

  handlePath() {
    this.path = this.pathArr.length > 0 ? this.pathArr.join('/') : '/';
  }

  getParentPath() {
    // const parent_path = this.pathArr.slice(1).join('/');
    // this.parentPath = this.path.length <= 1 ? '/' : '/' + parent_path + '/';
    // console.log(`parentPath`, this.parentPath);
    // return this.parentPath;
    const parent_path = this.pathArr.toString().split(',').join('/');
    this.parentPath = this.path.length <= 1 ? '/' : '/' + parent_path + '/';
    return this.parentPath;
  }

  async loadData() {
    this.getErr = false;
    await this.getFileFolder();
    if (this.childFoldersData.lib_need_decrypt) {
      this.isEncrypt = true;
      jQuery('#password-folder-modal').modal('show');
    } else {
      this.isEncrypt = false;
      this.addSizeForDir();
      this.handleBreadcrumbs();
      const data = onChangeTable(this.config, this.childFoldersData.dirent_list, this.columns, this.page);
      this.listChildFoldersDisplay = data.rows;
      this.length = data.length;
      this.getParentPath();
      this.handleTitle();
    }
  }

  openModalCreate(type) {
    this.createType = type;
    this.initValueNameValidate();
    this.handleCreateType(type);
    jQuery('#admin-modal-create-child-file').modal('show');
    this.createNewChildFileModal.handleAutoFocus();
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

  handleTitle() {
    if (this.path === '' || this.path === '/') {
      this.currentFolderName = this.childFoldersData.repo_name;
    } else {
      const pathArr = this.path.split('/');
      this.currentFolderName = pathArr[pathArr.length - 1];
    }

    this.titleService.setTitle(
      [
          {
            str: this.currentFolderName,
            translate: false
          }
      ]
    );
  }

  addSizeForDir() {
    this.childFoldersData.dirent_list.forEach((element) => {
      if (element['type'] === 'dir') {
        element['size'] = -1;
      }
    });
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.childFoldersData.dirent_list, this.columns, config, this.page);
    this.listChildFoldersDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.childFoldersData.dirent_list, this.columns, page);
    this.listChildFoldersDisplay = data.rows;
    this.length = data.length;
  }

  getFileFolder(): Promise<any> {
    return new Promise(resolve => {
      this.adminService.getFileFolderOfFolder(this.repoID, this.path).subscribe(resps => {
        this.childFoldersData = resps.data;
        this.isProcessing = false;
        resolve();
      });
    });
  }

  getItem(): Promise<any> {
    return new Promise(resolve => {
      this.filesService.getItemInFolder(this.repoID, this.path).subscribe(resps => {
        this.childFoldersData = resps.data;
        resolve();
      }, err => {
        this.getErr = true;
        this.errMsg = JSON.parse(err._body).message;
      });
    });
  }

  openFolder(nameFolder: string) {
    this.getNameOfFolder = nameFolder;
    // this.router.navigate(['/admin', 'folders', this.repoID, ...this.pathArr, nameFolder]);
    this.router.navigate(['/admin', 'folders', this.repoID, ...this.pathArr, nameFolder]);
    this.getParentPath();
  }

  downloadFile(nameFile: string) {
    this.adminService.getDownloadFileInSysFolders(this.repoID, this.getCurrentPathItem(nameFile)).subscribe(
      resps => window.location.href = resps.data.download_url,
      error => {
        console.error(error);
        this.notify.showNotification('danger', JSON.parse(error._body).message);
      }
    );
  }

  getCurrentPathItem(nameItem: string) {
    return !this.path ? '/' + nameItem : this.path + '/' + nameItem;
  }

  handleBreadcrumbs() {
    const addBreacrumbs = [];
    addBreacrumbs.push({ name: this.translate.instant('ADMIN.BREADCRUMB_CONTENT'), path: ['/admin', 'folders', 'all'] });
    addBreacrumbs.push({ name: this.translate.instant('ADMIN.FOLDERS.BREADCRUMB_CONTENT'), path: ['/admin', 'folders', 'all'] });
    // addBreacrumbs.push({ name: this.translate.instant('ADMIN.FOLDERS.ALL.BREADCRUMB_CONTENT'), path: ['/admin', 'folders', 'all'] });
    addBreacrumbs.push({ name: this.childFoldersData.repo_name, path: ['/admin', 'folders', this.repoID] });
    if (this.pathArr.length > 0) {
      this.pathArr.forEach((element, index) => {
        const meomeo = this.pathArr.slice(0, index);
        addBreacrumbs.push({
          name: this.pathArr[index],
          path: ['/admin', 'folders', this.repoID, ...this.pathArr.slice(0, index + 1)]
        });
      });
    }
    this.breadcrumbs = addBreacrumbs;
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }

  goBack() {
    if (this.breadcrumbs.length <= 4) {
      this.router.navigate(['admin', 'folders']);
    } else {
      this.breadcrumbs.splice(0, 4);
      this.router.navigate(['admin', 'folders', this.repoID, ...this.breadcrumbs]);
    }
  }

  setErrorImg(index) {
    this.listChildFoldersDisplay[index].imgError = 1;
  }

  prepareModalSubscription() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    );

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
      }));

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.loadData();
      })
    );
  }

  removeFileFolder(data) {
    const getPath = this.getCurrentPathItem(data.name);
    this.currentData = data;

    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(AdminDeleteModalComponent, {
      class: 'modal-md',
      initialState: {
        data: this.currentData,
        path: getPath,
        repoID: this.repoID,
      }
    });
  }
}
