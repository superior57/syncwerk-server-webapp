import { flatten } from '@angular/compiler';
import { Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild, Output, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';

import { AppConfig } from 'app/app.config';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import { Action, Type } from '@enum/index.enum';
import { FilesService, MessageService, NotificationService, AuthenticationService, NonAuthenticationService } from '@services/index';

@Component({
  selector: 'app-child-grid-view',
  templateUrl: './child-grid-view.component.html',
  styleUrls: ['./child-grid-view.component.scss']
})
export class ChildGridViewComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  private subscription: Subscription;
  @Input() dataSource;
  @Input() AtoZ = true;
  @Input() repoEncrypted: false;
  @Input() rangeSize: string;
  @Input() sharePermissions: any = {
    // can_generate_share_link: false,
    // can_generate_upload_link: false,
  };
  @Output() ClickModalAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() SendInfoChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() Sort: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('renameInput') renameInput: ElementRef;
  rename;
  nameFolderRegex = /^[^~#%*/\\:<>?|".]*$/;
  nameFileRegex = /^[^~#%*/\\:<>?|"]*$/;
  path: string[] = [];
  repoId: string;
  typeRepo = '';
  rangeTransformScale: number;
  classRangeSize: string;
  rangeHeightPx: string;
  parentPath = '';
  isSingleClick = false;
  extImages = ['png', 'jpeg', 'jpg'];
  arrFileLock: string[] = [];

  currentUserPermission: any = {
    can_generate_share_link: false,
    can_generate_upload_link: false,
  };

  isEnabledFilePreview = false;
  isEnabledPubliclShare = false;
  isRepoEncrypted = false;

  constructor(
    private filesService: FilesService,
    private appConfig: AppConfig,
    private noti: NotificationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private router: Router,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private nonAuthService: NonAuthenticationService,
    private clipboard: ClipboardService,
  ) {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFilePreview = resp.data.file_preview;
      this.isEnabledPubliclShare = resp.data.public_share;
    });

    this.activatedRoute.url.subscribe(params => this.path = params.map(data => data.path));
    this.repoId = this.path[0];
    this.getParentPath();
  }

  ngOnInit() {
    this.currentUserPermission = this.sharePermissions;
    this.subscribe();
    this.typeRepo = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rangeSize']) {
      this.handleChangeRangeSize();
      this.cookieService.put('syc_range_size', this.rangeSize);
    }
    if (changes.hasOwnProperty('dataSource')) {
      this.isRepoEncrypted = this.repoEncrypted;
      this.handleData();
    }
  }

  ngAfterViewInit() {
    this.handleChangeRangeSize();
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Child_Grid_View_Component, (payload) => {
      switch (payload.action) {
        case Action.Redirect_Bredcrumb:
          const type = encodeURI(this.router.url).split('/')[2];
          if (this.typeRepo.includes('group--')) {
            const paths = flatten(['/files', type, this.typeRepo.split('--')[1], this.path.slice(0, payload.data[0] - 1)]);
            this.router.navigate(paths);
          } else {
            const paths = flatten(['/files', type, this.path.slice(0, payload.data[0])]);
            this.router.navigate(paths);
          }
          break;
        default:
          break;
      }
    });
  }

  handleData(): Promise<any> {
    return new Promise((resolve) => {
      this.dataSource.forEach(element => {
        if (element.type === 'dir') {
          Object.assign(element, { size: '' });
        } else {
          if (this.isRepoEncrypted === false) {
            const extFile = element.name.split('.').filter((_, index, arr) => index === arr.length - 1)[0];
            this.getParentPath();
            if (this.extImages.includes(extFile)) {
              this.filesService.getThumbnailImage(this.repoId, this.parentPath + element.name, '80').subscribe(resps => {
                Object.assign(element, { thumbnail: resps.url });
              });
            }
          }
        }
      });
      resolve(this.dataSource);
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

  onKeyPress(event, type) {
    const inputChar = String.fromCharCode(event.charCode);
    const testRegex = (type === 'dir' ? this.nameFolderRegex : this.nameFileRegex);
    if (event.keyCode !== 8 && !testRegex.test(inputChar)) {
      event.preventDefault();
    }
  }

  changeName(r: any, event: any, index: number) {
    this.rename = -1;
    const newName = event.target.value.trim();
    const oldName = r.name;
    const type = this.dataSource[index].type;
    type === 'file'
      ? this.renameFileFolder(index, 'file', oldName, newName)
      : this.renameFileFolder(index, 'dir', oldName, newName);
  }

  renameFileFolder(index: number, type: string, oldName: string, newName: string) {
    const typeRename = type === 'file' ? 'file' : 'folder';
    const path = this.getParentPath() + oldName;
    if (this.checkNameValid(newName, typeRename)) {
      if (this.dataSource[index].name !== newName) {
        this.filesService.renameFileFolder(this.repoId, path, decodeURIComponent(newName), type)
          .subscribe(resp => {
            this.dataSource[index].name = newName;
            this.noti.showNotification('success', `Rename ${typeRename} success.`);
          }, error => {
            this.noti.showNotification('danger', `Rename ${typeRename} error.`);
          });
      }
    }
  }
  clickOnNameChange(r: any) {
    // event.preventDefault();
    setTimeout(() => {
      if (this.renameInput) {
        let c = r.name.length;
        if (r.type === 'file') {
          const n = r.name.split('.');
          if (n.length > 1) {
            c = r.name.length - n.pop().length - 1;
          }
        }
        this.renameInput.nativeElement.focus();
        this.renameInput.nativeElement.setSelectionRange(0, c);
      }
    }, 10);
  }
  checkNameValid(name: string, type: string) {
    if (name.length <= 0) {
      this.noti.showNotification('danger', `${type} name is required.`);
      return false;
    }
    const testRegex = (type === 'dir' ? this.nameFolderRegex : this.nameFileRegex);
    if (!testRegex.test(name)) {
      this.noti.showNotification('danger', `Invalid ${type} name.`);
      return false;
    }
    return true;
  }

  getParentPath() {
    const parent_path = this.path.slice(1).join('/');
    this.parentPath = this.path.length <= 1 ? '/' : '/' + parent_path + '/';
    return this.parentPath;
  }

  shareFolder(data, index) {
    this.ClickModalAction.emit({ data, index, 'action': 'share' });
    // this.messageService.send(Type.Share_Folder_Modal, Action.Open_New_Child_File, { data });
    this.messageService.send(Type.Password_Protect_Component, Action.Open_New_Child_File, '');
  }

  removeFolder(data, index) {
    this.ClickModalAction.emit({ data, index, 'action': 'delete' });
  }

  openFolder(name, type) {
    this.isSingleClick = true;
    if (type === 'dir') {
      const type_url = encodeURI(this.router.url).split('/')[2];
      if (this.typeRepo.includes('group--')) {
        const paths = flatten([
          '/groups',
          this.typeRepo.split('--')[1],
          'folders',
          this.path,
          name
          // name.replace(/\(/g, '%28').replace(/\)/g, '%29')
        ]);
        this.router.navigate(paths);
      } else {
        const paths = flatten(['/folders', this.path, name]);
        // name.replace(/\(/g, '%28').replace(/\)/g, '%29')
        this.router.navigate(paths);
      }
    }
  }

  sendData(repoId: string, type: any, repoType: string, path: string, name: string) {
    const payload = {
      type: type,
      folderId: repoId,
      repoType: repoType,
      path: path,
      name: name
    };
    this.messageService.broadcast(type, payload);
  }

  viewDetails(data) {
    const paths = this.path.toString().split(',');
    let path = '';
    for (let _i = 1; _i < paths.length; _i++) {
      path += paths[_i] + '%2F';
    }
    path += data.name;
    this.ClickModalAction.emit({ data, 'action': 'viewDetails' });
    this.sendData(paths[0], Type.Details_Modal, data.type, path, data.name);
  }

  openFilePreview(file) {
    this.isSingleClick = true;
    const p = this.router.url.split('/');
    const repoId = this.path[0];
    const path = ['/preview', repoId];
    const filePathArr = this.path.slice(1);
    const filePath = filePathArr.length > 0 ? `/${filePathArr.join('/')}/${file.name}` : `/${file.name}`;
    this.router.navigate(['preview', repoId], {
      queryParams: {
        p: filePath,
        ref: p[2] === 'groups' ? `/${p[1]}/${p[2]}/${p[3]}` : `/${p[1]}/${p[2]}`,
        parent: this.router.url,
      }
    });
  }

  copyFileFolder(data) {
    this.ClickModalAction.emit({ data, 'action': 'copy' });
  }

  moveFileFolder(data, index) {
    this.ClickModalAction.emit({ data, index, 'action': 'move' });
  }

  downloadItem(itemDetails) {
    if (itemDetails.type === 'file') {
      const filePath = `${this.getParentPath()}${itemDetails.name}`;
      this.downloadFile(this.repoId, filePath);
    } else {
      this.zipFolder(this.repoId, this.getParentPath(), itemDetails.name);
    }
  }

  zipFolder(repoID, parentPath, folderName) {
    this.filesService.zipFolder(repoID, parentPath, folderName).subscribe(resp => {
      this.messageService.send(Type.Zip_Progress_Modal, 'zip-start', resp.data);
    }, err => {
      this.noti.showNotification('danger', JSON.parse(err._body).message);
    });
  }

  downloadFile(repoID, filePath) {
    this.filesService.getDownloadLink(repoID, filePath).subscribe(resp => {
      window.location.href = resp.data.dl_url;
    });
  }

  historyFile(nameFile: string) {
    const path = `${this.getParentPath()}${nameFile}`;
    this.router.navigate(['repo', 'file-revision', this.repoId], { queryParams: { p: path } });
  }

  setErrorImg(index) {
    this.dataSource[index].imgError = 1;
  }

  handleChangeRangeSize() {
    const numberRangeSize = Number(this.rangeSize);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 110 && numberRangeSize <= 150) {
      this.rangeTransformScale = (numberRangeSize + 20) / 100;
      this.classRangeSize = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
      this.rangeTransformScale = (numberRangeSize + 40) / 100;
      this.classRangeSize = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
    }
    this.rangeHeightPx = 100 * this.rangeTransformScale + 'px';
  }

  handleChecked(itemData) {
    itemData.isChecked = !itemData.isChecked;
    // if (this.dataSource.filter((item) => !item.isChecked).length > 0) {
    //   this.selectedCheckAll.nativeElement.checked = false;
    // }
    this.SendInfoChecked.emit(this.dataSource.filter((item) => item.isChecked));
  }

  checkAll() {
    this.dataSource.forEach(element => element.isChecked = true);
    this.SendInfoChecked.emit(this.dataSource.filter((item) => item.isChecked));
  }

  uncheckAll() {
    this.dataSource.forEach(element => element.isChecked = false);
    this.SendInfoChecked.emit(this.dataSource.filter((item) => item.isChecked));
  }

  markFileStarred(fileName, ind) {
    this.filesService.markedFileStarred(this.repoId, this.pathForStarred(fileName)).subscribe(resp => {
      this.dataSource[ind].starred = true;
      this.noti.showNotification('success', this.translate.instant('FILE_BROWSER.MARKED_FAVORITE_SUCCESS', { fileName }));
    });
  }

  removeFileStarred(fileName, ind) {
    this.filesService.removeFileStarred(this.repoId, this.pathForStarred(fileName)).subscribe(resp => {
      this.dataSource[ind].starred = false;
      this.noti.showNotification('success', this.translate.instant('FILE_BROWSER.REMOVE_FAVORITE_SUCCESS', { fileName }));
    });
  }

  pathForStarred(filename) {
    let paths = '/';
    if (this.path.length > 1) {
      paths += this.path.slice(1).join('/');
      paths += '/';
    }
    return paths + filename;
  }

  lockFile(r, index) {
    let filePathArr: any = Object.assign([], this.path);
    filePathArr[0] = '';
    filePathArr.push(r.name);
    filePathArr = filePathArr.join('/');
    this.filesService.putLockUnlockFile(this.repoId, filePathArr, 'lock').subscribe(resp => {
      this.noti.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.LOCK_FILE_SUCCESS'));
      this.dataSource[index] = resp.data;
      this.arrFileLock.push(r.name);
    });
  }

  unlockFile(r, index) {
    let filePathArr: any = Object.assign([], this.path);
    filePathArr[0] = '';
    filePathArr.push(r.name);
    filePathArr = filePathArr.join('/');
    this.filesService.putLockUnlockFile(this.repoId, filePathArr, 'unlock').subscribe(resp => {
      this.noti.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.UNLOCK_FILE_SUCCESS'));
      this.dataSource[index] = resp.data;
      this.removeFileLock(r.name);
    });
  }

  removeFileLock(name) {
    let index = this.arrFileLock.indexOf(name);
    if (index !== -1) {
      this.arrFileLock.splice(index, 1);
    }
  }

  checkFileLockByMe(name) {
    return this.arrFileLock.indexOf(name) > -1 ? true : false;
  }

  copyInternalLinkToClipboard(item) {
    const type = item.type;
    const name = item.name;
    this.isSingleClick = true;
    this.uncheckAll();
    if (type === 'dir') {
      const type_url = encodeURI(this.router.url).split('/')[2];
      if (this.typeRepo.includes('group--')) {
        const paths = flatten([
          '/groups',
          this.typeRepo.split('--')[1],
          'folders',
          this.path,
          // name.replace(/\(/g, '%28').replace(/\)/g, '%29')
        ]);
        // this.router.navigate(paths);
        this.clipboard.copyFromContent(`${window.location.origin}${paths.join('/')}`);
      } else {
        const paths = flatten(['/folders', this.path, name]);
        // const paths = flatten(['/files', type_url, this.path, name.replace(/%28/g, '(').replace(/%29/g, ')')]);
        // this.router.navigate(paths);
        this.clipboard.copyFromContent(`${window.location.origin}${paths.join('/')}`);
      }
    } else if (type === 'file') {
      // TODO: open file in new tab.. Need passed in url
      const p = this.router.url.split('/');
      const path = ['/preview', this.repoId];
      const filePathArr = this.path.slice(1);
      const filePath = filePathArr.length > 0 ? `/${filePathArr.join('/')}/${name}` : `/${name}`;
      const urlTree = this.router.createUrlTree(['preview', this.repoId], {
        queryParams: {
          p: filePath,
          ref: p[2] === 'groups' ? `/${p[1]}/${p[2]}/${p[3]}` : `/${p[1]}/${p[2]}`,
          parent: this.router.url
        }
      })
      this.clipboard.copyFromContent(`${window.location.origin}${urlTree.toString()}`);

    }
    // this.clipboard.copyFromContent(`${window.location.href}/${item.id}`);
    this.noti.showNotification('success', this.translate.instant('NOTIFY_MSG.SUCCESS.INTERNAL_LINK_COPIED'));
  }
}
