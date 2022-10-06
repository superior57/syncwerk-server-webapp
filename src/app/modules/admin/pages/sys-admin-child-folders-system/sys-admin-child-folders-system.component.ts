import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AdminService, NotificationService, MessageService, AuthenticationService } from 'app/services';
import { Type } from '@enum/index.enum';
import { TranslateService } from '@ngx-translate/core';

import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { Select2OptionData } from 'ng2-select2';

declare const jQuery: any;

@Component({
  selector: 'app-sys-admin-child-folders-system',
  templateUrl: './sys-admin-child-folders-system.component.html',
  styleUrls: ['./sys-admin-child-folders-system.component.scss']
})
export class SysAdminChildFoldersSystemComponent implements OnInit, OnDestroy {

  private subcriptionUpload: Subscription;
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

  segmentsPath = [];
  repoID: string;
  currentPath: string;
  dataFileFolder: { [key: string]: any } = {};
  isProcessing = true;
  isOpenModal = {
    create_folder: false,
    upload: false,
    delete: false,
    download_file: false,
  };
  currentItem: any;
  isDropzoneShow = false;
  getDirentListInterval: any;
  // breadcrumbs = {
  //   paths: []
  // };
  breadcrumbs = [];
  // Data Table
  dataFileFolderDisplay: Array<any> = [];
  columns: Array<any> = [
    { title: 'TABLE.COLUMNS.NAME', name: 'obj_name', width: '40%' },
    { title: 'TABLE.COLUMNS.SIZE', name: 'file_size', width: '15%', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.LAST_UPDATE', name: 'last_update', width: '15%', class: 'd-none d-lg-table-cell' }
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
  currentFolderName = '';
  parentPath = '';
  path = '';

  currentUserPermission: any = {
    can_manage_folder: false,
  };


  constructor(
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private notification: NotificationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private authService: AuthenticationService,
  ) {
    this.activatedRoute.url.subscribe(segments => {
      this.segmentsPath = segments.map(data => data.path);
      this.repoID = this.segmentsPath[0];
      const handleCurrentPath = '/' + this.segmentsPath.filter((_, index) => index !== 0).join('/');
      this.currentPath = this.segmentsPath.length === 1 ? '/' : handleCurrentPath;
      this.loadData();
      this.handlePath();
    });
    this.subscribe();
  }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;

    });
  }

  handlePath() {
    console.log('path segement', this.segmentsPath);
    this.path = this.segmentsPath.length > 1 ? this.segmentsPath.join('/') : '/';
  }

  getParentPath() {
    const parent_path = this.segmentsPath.slice(1).join('/');
    this.parentPath = this.path.length <= 1 ? '/' : '/' + parent_path + '/';
    console.log('Parent path', this.parentPath);
    return this.parentPath;
  }

  subscribe() {
    this.subcriptionUpload = this.messageService.subscribe(Type.Upload_Process_Popup, (payload) => {
      switch (payload.action) {
        case 'upload-complete':
          this.getDirentListInterval = setInterval(() => {
            this.adminService.getFileFolderOfFolder(this.repoID, this.currentPath)
              .subscribe(resps => {
                if (this.dataFileFolder.dirent_list.length !== resps.data.dirent_list.length) {
                  this.notification.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.UPLOAD_FILE_FOLDER_SUCCESSFULLY'));
                  this.dataFileFolder = resps.data;
                  const data = onChangeTable(this.config, this.dataFileFolder.dirent_list, this.columns, this.page);
                  this.dataFileFolderDisplay = data.rows;
                  this.length = data.length;
                  clearInterval(this.getDirentListInterval);
                }
              });
          }, 1000);
          break;
        default:
          break;
      }
    });
  }

  get unsubscribed() {
    return this.subcriptionUpload && this.subcriptionUpload.closed;
  }

  unsubscribe() {
    if (this.subcriptionUpload) {
      this.subcriptionUpload.unsubscribe();
    }
    if (this.subcriptionUpload) {
      this.subcriptionUpload.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  async loadData() {
    await this.getFileFolder();
    this.isProcessing = false;
    // this.dataFileFolderDisplay = this.dataFileFolder.dirent_list;
    const data = onChangeTable(this.config, this.dataFileFolder.dirent_list, this.columns, this.page);
    this.dataFileFolderDisplay = data.rows;
    this.length = data.length;
    this.handleBreadcrumbs();
    this.handleCurrentFolderName();
    this.getParentPath();
  }

  handleCurrentFolderName() {
    if (this.segmentsPath.length === 1) {
      this.currentFolderName = this.dataFileFolder.repo_name;
    } else {
      this.currentFolderName = this.segmentsPath[this.segmentsPath.length - 1];
    }
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.dataFileFolder.dirent_list, this.columns, config, this.page);
    this.dataFileFolderDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.dataFileFolder.dirent_list, this.columns, page);
    this.dataFileFolderDisplay = data.rows;
    this.length = data.length;
  }

  getFileFolder(): Promise<any> {
    return new Promise((resolve) => {
      this.adminService.getFileFolderOfFolder(this.repoID, this.currentPath)
        .subscribe(resps => {
          this.dataFileFolder = resps.data;
          resolve();
        });
    });
  }

  openFolder(nameFolder: string) {
    this.router.navigateByUrl(`/admin/folders/system/${this.repoID}${this.getPath(nameFolder)}`);
  }

  handleOpenModal(typeModal) {
    if (typeModal === 'create-folder') {
      this.isOpenModal.create_folder = true;
      this.openModal('#modal-create-new-folder', () => this.isOpenModal.create_folder = false);
    } else if (typeModal === 'delete') {
      this.isOpenModal.delete = true;
      this.openModal('#modal-folders-system-delete-item', () => this.isOpenModal.delete = false);
    }
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  onCreatedReload(messageSuccess: string) {
    this.loadData();
    jQuery('#modal-create-new-folder').modal('hide');
    this.notification.showNotification('success', messageSuccess);
  }

  deleteItem(dataItem: any) {
    this.currentItem = {
      data_item: dataItem,
      repo_id: this.repoID,
      path: this.getPath(dataItem.obj_name),
    };
    this.handleOpenModal('delete');
  }

  onDeletedReload(messageSuccess: string) {
    this.loadData();
    jQuery('#modal-folders-system-delete-item').modal('hide');
    this.notification.showNotification('success', messageSuccess);
  }

  downloadFile(nameFile: string) {
    this.adminService.getDownloadFileInSysFolders(this.repoID, this.getPath(nameFile)).subscribe(
      resps => window.location.href = resps.data.download_url,
      error => {
        console.error(error);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      }
    );
  }

  getPath(nameItem: string) {
    return this.currentPath === '/' ? '/' + nameItem : this.currentPath + '/' + nameItem;
  }

  onfileDrop(data) {
    this.isDropzoneShow = false;
    if (data.files.length === 0) {
      return;
    }
    this.messageService.send(Type.Upload_Process_Popup, 'show', {
      uploadFileList: data,
      repoIDForUpload: this.repoID,
      pathForUpload: this.currentPath,
      uploadFrom: 'system-folders',
      type: 'file-drop'
    });
  }

  onClickUploadFile(data) {
    this.messageService.send(Type.Upload_Process_Popup, 'show', {
      uploadFileList: data.target.files,
      repoIDForUpload: this.repoID,
      pathForUpload: this.currentPath,
      uploadFrom: 'system-folders',
      type: 'click-input-upload',
    });
  }

  setErrorImg(index) {
    this.dataFileFolder.dirent_list[index].imgError = 1;
  }

  handleBreadcrumbs() {
    const addBreacrumbs = [];
    addBreacrumbs.push({ name: this.translate.instant('ADMIN.BREADCRUMB_CONTENT'), path: ['/admin', 'folders', 'system'] });
    addBreacrumbs.push({ name: this.translate.instant('ADMIN.FOLDERS.BREADCRUMB_CONTENT'), path: ['/admin', 'folders', 'system'] });
    addBreacrumbs.push({ name: this.translate.instant('ADMIN.FOLDERS.SYSTEM.BREADCRUMB_CONTENT'), path: ['/admin', 'folders', 'system'] });
    addBreacrumbs.push({ name: this.dataFileFolder.repo_name, path: ['/admin', 'folders', 'system', this.repoID] });
    if (this.segmentsPath.length > 1) {
      this.segmentsPath.forEach((element, index) => {
        if (index !== 0) {
          addBreacrumbs.push({
            name: this.segmentsPath[index],
            path: ['/admin', 'folders', 'system', this.repoID, ...this.segmentsPath.slice(1, index + 1)]
          });
        }
      });
    }
    this.breadcrumbs = addBreacrumbs;
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }

  showDropzone() {
    this.isDropzoneShow = true;
    window.scrollTo(0, 0);
  }

  goBack() {
    if (this.segmentsPath.length <= 1) {
      this.router.navigate(['admin', 'folders', 'system']);
    } else {
      this.segmentsPath.pop();
      this.router.navigate(['admin', 'folders', 'system', ...this.segmentsPath]);
    }
  }
}
