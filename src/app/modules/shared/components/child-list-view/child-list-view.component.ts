import { flatten, isNgTemplate } from '@angular/compiler';
import {
  Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef, SimpleChanges, OnChanges, SimpleChange
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';

import { AppConfig } from 'app/app.config';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import { Action, Type } from '@enum/index.enum';
import { FilesService, AuthenticationService, NotificationService, MessageService, NonAuthenticationService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';

import { sortByColumn, onChangeTable } from 'app/app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-child-list-view',
  templateUrl: './child-list-view.component.html',
  styleUrls: ['./child-list-view.component.scss']
})
export class ChildListViewComponent implements OnInit, OnChanges {

  private subscription: Subscription;
  @Input() listFiles: Array<any> = [];
  @Input() repoEncrypted: false;
  @Input() columns = [];
  @Input() sharePermissions: any = { };
  @Output() ClickModalAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() SendInfoCheckedAll: EventEmitter<any> = new EventEmitter<any>();
  @Output() SendInfoChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() sorted: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('renameInput') renameInput: ElementRef;
  @ViewChild('checkAll') selectedCheckAll;
  @ViewChild('checkAllMobile') selectedCheckAllMobile;

  isSingleClick = false;
  rename;
  nameFolderRegex = /^[^~#%*/\\:<>?|".]*$/;
  nameFileRegex = /^[^~#%*/\\:<>?|"]*$/;
  path: string[] = [];
  repoId: string;
  favorited: boolean;
  isCheckedAll = false;
  isChecked: boolean;
  typeRepo = '';
  parentPath = '';
  extImages = ['png', 'jpeg', 'jpg'];
  params: any;

  slash = '#';
  symbol = 'link';
  arrFileLock: string[] = [];

  currentUserPermission: any = {
    can_generate_share_link: false,
    can_generate_upload_link: false,
  };

  isEnabledFilePreview = false;
  isEnabledPubliclShare = false;


  constructor(
    private filesService: FilesService,
    private appConfig: AppConfig,
    private noti: NotificationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private authService: AuthenticationService,
    private nonAuthService: NonAuthenticationService,
    private clipboard: ClipboardService,

  ) {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFilePreview = resp.data.file_preview;
      this.isEnabledPubliclShare = resp.data.public_share;

    });

    this.activatedRoute.url.subscribe((params) => {
      window.scrollTo(0, 0);
      this.path = params.map(data => data.path);
      this.getParentPath();
      this.initData();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('listFiles')) {
      this.handleData();
    }
  }

  ngOnInit() {
    this.currentUserPermission = this.sharePermissions;
    this.subscribe();
    const defaultSortColumn = this.columns.filter(col => col.is_default);
    if (defaultSortColumn.length > 0) {
      this.sortColumnSelected(defaultSortColumn[0]);
    }
  }

  initData() {
    this.isCheckedAll = false;
    this.repoId = this.path[0];
    this.favorited = false;
    this.typeRepo = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Child_List_View_Component, (payload) => {
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
      this.listFiles.forEach(element => {
        if (element.type === 'dir') {
          Object.assign(element, { size: '' });
        } else {
          const extFile = element.name.split('.').filter((_, index, arr) => index === arr.length - 1)[0];
          if (this.extImages.includes(extFile)) {
            this.filesService.getThumbnailImage(this.repoId, this.parentPath + element.name, '80').subscribe(resps => {
              Object.assign(element, { thumbnail: resps.url });
            });
          }
        }
      });
      resolve(this.listFiles);
    });
  }

  onKeyPress(event: any, type) {
    const testRegex = (type === 'dir' ? this.nameFolderRegex : this.nameFileRegex);
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !testRegex.test(inputChar)) {
      event.preventDefault();
    }
  }

  changeName(r: any, event: any, index: number) {
    this.rename = -1;
    const newName = event.target.value.trim();
    const oldName = r.name;
    const type = this.listFiles[index].type;
    type === 'file'
      ? this.renameFileFolder(index, 'file', oldName, newName)
      : this.renameFileFolder(index, 'dir', oldName, newName);
  }
  triggerNameChange() {
    const el: HTMLElement = this.renameInput.nativeElement as HTMLElement;
    const ev = new KeyboardEvent('keyup', { key: 'enter', code: '13' });
    el.dispatchEvent(ev);
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

  renameFileFolder(index: number, type: string, oldName: string, newName: string) {
    const typeRename = type === 'file' ? 'file' : 'folder';
    const path = this.getParentPath() + oldName;
    if (this.checkNameValid(newName, typeRename)) {
      if (this.listFiles[index].name !== newName) {
        this.filesService.renameFileFolder(this.repoId, path, decodeURIComponent(newName), type)
          .subscribe(resp => {
            this.listFiles[index].name = newName;
            this.noti.showNotification('success', `Rename ${typeRename} success.`);
          }, error => {
            this.noti.showNotification('danger', `Rename ${typeRename} error.`);
          });
      }
    }
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
    this.messageService.send(Type.Password_Protect_Component, Action.Open_New_Child_File, '');
  }

  removeFolder(data: any, index: number) {
    this.ClickModalAction.emit({ data, index, 'action': 'delete' });
  }

  openFolder(name: string, type: string) {
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
        this.router.navigate(paths);
      } else {
        const paths = flatten(['/folders', this.path, name]);
        // const paths = flatten(['/files', type_url, this.path, name.replace(/%28/g, '(').replace(/%29/g, ')')]);
        this.router.navigate(paths);
      }
    } else if (type === 'file') {
      // TODO: open file in new tab.. Need passed in url
      const p = this.router.url.split('/');
      const path = ['/preview', this.repoId];
      const filePathArr = this.path.slice(1);
      const filePath = filePathArr.length > 0 ? `/${filePathArr.join('/')}/${name}` : `/${name}`;
      this.router.navigate(['preview', this.repoId], {
        queryParams: {
          p: filePath,
          ref: p[2] === 'groups' ? `/${p[1]}/${p[2]}/${p[3]}` : `/${p[1]}/${p[2]}`,
          parent: this.router.url
        }
      });
    }
  }
  sendData(type: any, repoType: string, path: string, name: string) {
    const payload = {
      type: type,
      folderId: this.repoId,
      repoType: repoType,
      path: path,
      name: name
    };
    this.messageService.broadcast(type, payload);
  }

  handlePath(paths: any) {
    let path = '';
    for (let i = 1; i < paths.length; i++) {
      path += paths[i] + '/';
    }
    return path;
  }

  viewDetails(data) {
    const paths = this.path.toString().split(',');
    const path = this.handlePath(paths) + data.name;
    this.ClickModalAction.emit({ data, 'action': 'viewDetails' });
    this.sendData(Type.Details_Modal, data.type, path, data.name);
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
    this.filesService.getDownloadLink(repoID, filePath)
      .subscribe(resp => window.location.href = resp.data.dl_url);
  }

  historyFile(nameFile: string) {
    const path = `${this.getParentPath()}${nameFile}`;
    this.router.navigate(['repo', 'file-revision', this.repoId], {
      queryParams: {
        p: path,
      }
    });
  }

  handleCheckAll() {
    this.isCheckedAll = !this.isCheckedAll;
    this.isCheckedAll ? this.checkAll() : this.uncheckAll();
  }

  checkAll() {
    if (this.selectedCheckAll) {
      this.selectedCheckAll.nativeElement.checked = true;
    }
    if (this.selectedCheckAllMobile) {
      this.selectedCheckAllMobile.nativeElement.checked = true;
    }
    this.listFiles.forEach(element => element.isChecked = true);
    this.SendInfoChecked.emit(this.listFiles.filter((item) => item.isChecked));
  }

  uncheckAll() {
    if (this.selectedCheckAll) {
      this.selectedCheckAll.nativeElement.checked = false;
    }
    if (this.selectedCheckAllMobile) {
      this.selectedCheckAllMobile.nativeElement.checked = false;
    }
    this.listFiles.forEach(element => element.isChecked = false);
    this.SendInfoChecked.emit(this.listFiles.filter((item) => item.isChecked));
  }

  handleChecked(itemData) {
    itemData.isChecked = !itemData.isChecked;
    if (this.listFiles.filter((item) => !item.isChecked).length > 0) {
      if (this.selectedCheckAll) {
        this.selectedCheckAll.nativeElement.checked = false;
      }
      if (this.selectedCheckAllMobile) {
        this.selectedCheckAllMobile.nativeElement.checked = false;
      }
    }

    this.SendInfoChecked.emit(this.listFiles.filter((item) => item.isChecked));
  }

  markFileStarred(fileName, ind) {
    this.filesService.markedFileStarred(this.repoId, this.pathForStarred(fileName)).subscribe(resp => {
      this.listFiles[ind].starred = true;
    });
  }

  removeFileStarred(fileName, ind) {
    this.filesService.removeFileStarred(this.repoId, this.pathForStarred(fileName)).subscribe(resp => {
      this.listFiles[ind].starred = false;
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

  setErrorImg(index) {
    this.listFiles[index].imgError = 1;
  }

  sortColumnSelected(column) {
    this.sorted.emit(column);
  }

  onToggleOpenDetail(e) {
    const countElmTr = document.getElementsByClassName('sm__display__grid');
    const iconDetail = document.getElementsByClassName('sm__detail__icon');
    for (let i = 0; i < countElmTr.length; i++) {
      if (i === e) {
        const getStyle = countElmTr[i].getAttribute(`style`);
        if (getStyle !== `height: 200px`) {
          countElmTr[i].setAttribute(`style`, `height: 200px`);
          iconDetail[i].setAttribute(`style`, `transform: rotate(180deg); color: #0067b3 `);
        } else {
          countElmTr[i].setAttribute(`style`, `height: 51px`);
          iconDetail[i].setAttribute(`style`, `transform: rotate(0deg)`);
        }
      }
    }
  }

  lockFile(r, index) {
    let filePathArr: any = Object.assign([], this.path);
    filePathArr[0] = '';
    filePathArr.push(r.name);
    filePathArr = filePathArr.join('/');
    this.filesService.putLockUnlockFile(this.repoId, filePathArr, 'lock').subscribe(resp => {
      this.noti.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.LOCK_FILE_SUCCESS'));
      r.is_locked = true;
      // this.listFiles[index] = resp.data;
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
      r.is_locked = false;
      // this.listFiles[index] = resp.data;
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
