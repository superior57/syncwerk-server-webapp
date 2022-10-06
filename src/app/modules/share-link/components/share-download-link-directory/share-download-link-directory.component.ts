import {Component, OnInit, SimpleChanges, OnChanges, Input, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Action, Type } from '@enum/index.enum';
import {NotificationService, ShareLinkService, MessageService, FilesService, AdminService} from '@services/index';
import { isEmpty } from 'app/app.helpers';
import { flatten } from '@angular/compiler';
import { SharedService } from "@services/shared.service";
import { CookieService } from 'ngx-cookie';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import {TranslateService} from '@ngx-translate/core';
import { saveAs } from "file-saver";

@Component({
  selector: 'app-share-download-link-directory',
  templateUrl: './share-download-link-directory.component.html',
  styleUrls: ['./share-download-link-directory.component.scss']
})

export class ShareDownloadLinkDirectoryComponent implements OnInit {
  @Input() rangeSize: string;
  @ViewChild('checkAll') selectedCheckAll;
  @ViewChild('checkAllMobile') selectedCheckAllMobile;

  token: string;
  dataDownload;
  fileFolderList;
  isPageNotFound = false;
  nameRootFolder: string;
  breadcrumbsObj = {
    paths: '',
  };
  parentPath: string;
  parentPathFromApi: string;
  hasAudit: boolean;
  hasPasswordProtected: boolean;
  params: any;
  maTheme: string = this.sharedService.maTheme;
  isListView = false;
  dataRangeSizeGrid: { [key: string]: any } = {};

  titlePage: string;

  maxSizeZip = false;

  repoId: string;
  path: string[] = [];
  extImages = ['png', 'jpeg', 'jpg', 'gif'];
  // Added By Ibrahim E.Gad for batch download
  allowFoldersInBatch = 1;
  batchMaxFilesCount = 50;
  hasFolderSelected = false;
  listChecked = [];
  countCheckedItem: number;
  batchButtonEnabled: boolean;
  classRangeSize: string;
  rangeTransformScale: number;
  rangeHeightPx: string;

  constructor(
      private adminService: AdminService,
      private route: ActivatedRoute,
      private shareLinkService: ShareLinkService,
      private router: Router,
      private noti: NotificationService,
      private messageService: MessageService,
      private sharedService: SharedService,
      private cookieService: CookieService,
      private filesService: FilesService,
      private translate: TranslateService,
  ) {

    sharedService.maThemeSubject.subscribe((value) => {
      this.maTheme = value;
    });
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
    this.route.queryParamMap.subscribe(queryParamMap => {
      if (queryParamMap.keys.length === 0) {
        this.parentPath = '/';
        this.getShareLinkDir();
      } else {
        const splitPath = queryParamMap.get('p').split('/');
        const nameFolder = splitPath.filter((_, index) => index === splitPath.length - 2).toString();
        this.titlePage = nameFolder;
        this.parentPath = queryParamMap.get('p');
        this.getShareLinkDir({ p: queryParamMap.get('p') });
        const splitPathWithoutBlank = splitPath.filter(ele => ele.trim() !== '');
        this.titlePage = splitPathWithoutBlank[splitPathWithoutBlank.length - 1];
      }
    });
  }

  ngOnInit() {
    this.adminService.getSettingsByKeys('ALLOW_FOLDERS_IN_BATCH,BATCH_MAX_FILES_COUNT').subscribe(
        resp => {
          this.allowFoldersInBatch = resp.data.config_dict['ALLOW_FOLDERS_IN_BATCH'];
          this.batchMaxFilesCount = resp.data.config_dict['BATCH_MAX_FILES_COUNT'];
          this.changeBatchButtonStatus();
        }
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['rangeSize']) {
      this.handleChangeRangeSize();
      this.cookieService.put('syc_range_size', this.rangeSize);
    }
  }
  ngAfterViewInit() {
    this.handleChangeRangeSize();
  }
  changeBatchButtonStatus() {
    this.batchButtonEnabled = (this.countCheckedItem > 1 && !this.hasFolderSelected) ||
        (this.countCheckedItem > 0 && this.hasFolderSelected && '' + this.allowFoldersInBatch === '1');
  }
  handleCheckAll() {
    if (this.selectedCheckAll) {
      this.fileFolderList.forEach(element => element.isChecked = this.selectedCheckAll.nativeElement.checked);
    }
    if (this.selectedCheckAllMobile) {
      this.fileFolderList.forEach(element => element.isChecked = this.selectedCheckAllMobile.nativeElement.checked);
    }
    const folders = this.listChecked.filter(row => row.type === 'dir');
    this.hasFolderSelected = folders.length > 0;
    this.countCheckedItem = this.listChecked.length;
    this.changeBatchButtonStatus();
  }
  handleChangeRangeSize() {
    const numberRangeSize = Number(this.rangeSize);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.dataRangeSizeGrid.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 110 && numberRangeSize <= 150) {
      this.dataRangeSizeGrid.rangeTransformScale = (numberRangeSize + 20) / 100;
      this.classRangeSize = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
      this.dataRangeSizeGrid.rangeTransformScale = (numberRangeSize + 40) / 100;
      this.classRangeSize = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
    }
    this.dataRangeSizeGrid.rangeHeightPx = 100 * this.dataRangeSizeGrid.rangeTransformScale + 'px';
  }
  handleChecked(itemData) {
    itemData.isChecked = !itemData.isChecked;
    this.listChecked = this.fileFolderList.filter(row => row.isChecked === true);
    if (this.listChecked.length !== this.fileFolderList.length) {
      if (this.selectedCheckAll) {
        this.selectedCheckAll.nativeElement.checked = false;
      }
      if (this.selectedCheckAllMobile) {
        this.selectedCheckAllMobile.nativeElement.checked = false;
      }
    } else {
      if (this.selectedCheckAll) {
        this.selectedCheckAll.nativeElement.checked = true;
      }
      if (this.selectedCheckAllMobile) {
        this.selectedCheckAllMobile.nativeElement.checked = true;
      }
    }
    const folders = this.listChecked.filter(row => row.type === 'dir');
    this.hasFolderSelected = folders.length > 0;
    this.countCheckedItem = this.listChecked.length;
    this.changeBatchButtonStatus();
  }
  batchDownloadChecked(dir) {
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
    const dirents = this.listChecked.map(ele => ele.obj_name).join('&dirents=');
    this.shareLinkService.getBatchDownloadLinks(this.token, this.parentPath, dirents)
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
  getShareLinkDir(query: any = null) {
    const queryShareLink = query === null ? null : `p=${query.p}&mode=list`;
    this.shareLinkService.getShareLink(this.token, 'd', queryShareLink)
        .subscribe(resps => {
          if(!resps.data.parent_dir) { resps.data.parent_dir = ''; }
          this.repoId = resps.data.repo_id;
          this.hasAudit = resps.data.share_link_audit;
          this.parentPathFromApi = resps.data.parent_dir === '/' ? '' : resps.data.parent_dir;
          if (query === null || query.p === '/' || query.p === '') {
            this.titlePage = resps.data.dir_name;
          }
          if (!resps.data.share_link_audit) { this.checkPasswordProtect(resps.data); }
        }, error => {
          console.error(error);
          const status = error.status;
          switch (status) {
            case 404: this.isPageNotFound = true; break;
            default: break;
          }
        });
  }

  handleData() {
    this.fileFolderList.forEach((elm) => {
      if (elm.type === 'file') {
        if(!this.repoId) { this.repoId = this.dataDownload.repo_id; }
        const extFile = elm.obj_name.split('.').filter((_, index, arr) => index === arr.length - 1)[0];
        if (this.extImages.includes(extFile)) {
          this.filesService.getThumbnailImage(this.repoId, this.parentPathFromApi + elm.obj_name, '80').subscribe(resp => {
            Object.assign(elm, { thumbnail: resp.url });
          });
        }
      }
    });
  }

  getParentPath() {
    const parent_path = this.path.slice(1).join('/');
    this.parentPath = this.path.length <= 1 ? '/' : '/' + parent_path + '/';
    return this.parentPath;
  }

  checkPasswordProtect(data: any) {
    this.hasPasswordProtected = data.password_protected;
    if (!data.password_protected) {
      this.dataDownload = data;
      this.fileFolderList = [...data.dir_list, ...data.file_list];
      this.handleData();
      this.nameRootFolder = data.dir_name;
      this.handleBreadcrumbs();
    }

    const path = this.dataDownload.path;
    if (path.length) {
      this.zipShareLinkFolder(path, null, true);
    }
  }

  zipShareLinkFolder(path: string, nameChild: string = null, maxSize: boolean = false) {
    console.log(`call me`);

    path = nameChild === null ? path : this.handlePathChildFolder(path, nameChild, 'dir');

    console.log(`path`, path);

    this.shareLinkService.getUrlShareLinkZipFolder(this.token, path)
        .subscribe(resp => {
          const respUrlArr = resp.data.url.split('/');
          const payload = {
            url: resp.data.url,
            zip_token: respUrlArr[respUrlArr.length - 1],
          };

          maxSize ? this.maxSizeZip = true : this.messageService.send(Type.Zip_Progress_Modal, 'zip-start', payload);
        }, error => {
          try {
            maxSize ? this.maxSizeZip = false : this.noti.showNotification('danger', JSON.parse(error._body).message);
          } catch (e) { console.error(error); }
        });
  }

  downloadFile(path: string, itemName: string) {
    this.shareLinkService.postGetLinkDownloadFileInDir(this.token, path === '/' ? itemName : path + itemName)
        .subscribe(resps => window.location.href = resps.data.dl_url, error => console.error(error));
  }

  openFileFolder(name: string, type: string, path: string) {
    const pathOpen = this.handlePathChildFolder(path === '/' ? '' : path, name, type);
    if (type === 'dir') {
      this.shareLinkService.getShareDownloadLinkDirectory(this.token, pathOpen, 'list')
          .subscribe(resps => {
            this.dataDownload = resps.data;
            this.fileFolderList = [...resps.data.dir_list, ...resps.data.file_list];
            this.handleBreadcrumbs();
            this.router.navigate(['share-link', 'd', this.token], { queryParams: { p: pathOpen, mode: 'list' } });
          }, error => console.error(error));
    } else {
      this.router.navigate(['share-link', 'd', this.token, 'files'], { queryParams: { p: pathOpen } });
    }
  }

  handlePathChildFolder(parentPath: string, nameChild: string, type: string) {
    return type === 'dir' ? parentPath + nameChild + '/' : parentPath + nameChild;
  }

  handleBreadcrumbs() {
    let pathBreacrumbs = '';
    this.dataDownload.zipped.forEach(element => pathBreacrumbs += `/${element[0]}`);
    this.breadcrumbsObj = { paths: pathBreacrumbs + '/' };
  }

  clickNavigateBreadcrumbs(data) {
    const path = flatten(['share-link', 'd', this.token]);
    this.router.navigate(path, { queryParams: { p: data.p, mode: 'list' } });
  }

  receiveDataAuditSuccess(data) {
    this.hasAudit = false;
    this.checkPasswordProtect(data);
  }

  receiveDataPassProtectedSuccess(data) {
    this.checkPasswordProtect(data);
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  changeTypeCol(rangeSizeValue: string) {
    const numberRangeSize = Number(rangeSizeValue);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.dataRangeSizeGrid.rangeTransformScale = numberRangeSize / 100;
      this.dataRangeSizeGrid.rangeClass = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 120 && numberRangeSize < 150) {
      this.dataRangeSizeGrid.rangeTransformScale = (numberRangeSize + 20) / 100;
      this.dataRangeSizeGrid.rangeClass = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
      this.dataRangeSizeGrid.rangeTransformScale = (numberRangeSize + 40) / 100;
      this.dataRangeSizeGrid.rangeClass = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
    }
    this.dataRangeSizeGrid.rangeHeightPx = 100 * this.dataRangeSizeGrid.rangeTransformScale + 'px';
  }
}
