import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';

import { AppConfig } from 'app/app.config';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import { FoldersModel } from 'app/Models/Folder.model';
import { Action, Type } from '@enum/index.enum';
import { ClipboardService } from 'ngx-clipboard';
import { TranslateService } from '@ngx-translate/core';
import { FilesService, MessageService, NotificationService, GroupsService, NonAuthenticationService } from '@services/index';

import { UnshareModalComponent } from '@shared/components/unshare-modal/unshare-modal.component';
import { RootFilesComponent } from '@shared/components/root-files/root-files.component';

declare var jQuery: any;

@Component({
  selector: 'app-root-grid-view',
  templateUrl: './root-grid-view.component.html',
  styleUrls: ['./root-grid-view.component.scss']
})
export class RootGridViewComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() ListFolders: FoldersModel[] = [];
  @Input() AtoZ = true;
  @Input() typeRepo;
  @Input() isStaff: boolean;
  @Input() rangeSize: string;
  @Output() ClickModalAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() Sort: EventEmitter<any> = new EventEmitter<any>();
  @Output() unshared = new EventEmitter<any>();
  @ViewChild('renameInput') renameInput: ElementRef;
  @ViewChild(UnshareModalComponent) unshareModal;

  rename;
  libNameRegex = /^[^~#%*/\\:<>?|".]*$/;
  groupList = false;
  currentItem: any;
  openUnshareModal = false;
  isOpenModal = {
    change_desc: false
  };


  // For slider
  rangeTransformScale: number;
  classRangeSize: string;
  rangeHeightPx: string;

  isEnabledInternalShare = false;
  isEnabledPubliclShare = false;
  isEnabledShareButton = false;

  constructor(
    private filesService: FilesService,
    private appConfig: AppConfig,
    private noti: NotificationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private router: Router,
    private groupsService: GroupsService,
    private nonAuthSerice: NonAuthenticationService,
    private clipboard: ClipboardService,
    private translate: TranslateService,

  ) {
    this.nonAuthSerice.getAvailableFeatures().subscribe(resp => {
      this.isEnabledInternalShare = resp.data.internal_share;
      this.isEnabledPubliclShare = resp.data.public_share;
      if (!this.isEnabledInternalShare && !this.isEnabledPubliclShare) {
        this.isEnabledShareButton = false;
      } else {
        this.isEnabledShareButton = true;
      }
    });
  }

  ngOnInit() {
    this.typeRepo = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
    this.isGroupList();
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

  send(folderId: string, type: any) {
    const payload = {
      type: type,
      folderId: folderId,
      repoType: 'folder'
    };
    this.messageService.broadcast(type, payload);
  }

  removeFolder(folder: FoldersModel, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'delete' });
  }

  shareFolder(folder: FoldersModel, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'shared' });
    this.messageService.send(Type.Password_Protect_Component, Action.Open_New, '');
  }

  transferFolder(folder: FoldersModel, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'transferFolder' });
    this.send(folder.id, Type.Transfer_Folder_Modal);
  }

  historySetting(folder: FoldersModel, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'historySetting' });
    this.send(folder.id, Type.History_Setting_Modal);
  }

  changePassword(folder: FoldersModel, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'changePassword' });
    this.send(folder.id, Type.Change_Password_Modal);
  }

  sortAction() {
    this.Sort.emit('');
  }

  onKeyPress(event) {
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !this.libNameRegex.test(inputChar)) {
      event.preventDefault();
    }
  }

  changeName(event, index) {
    this.rename = -1;
    const libName = event.target.value.trim();
    if (libName.length <= 0) {
      this.noti.showNotification('danger', 'Name is required.');
      return;
    }
    if (!this.libNameRegex.test(libName)) {
      this.noti.showNotification('danger', 'Invalid folder name.');
      return;
    }
    if (this.ListFolders[index].name !== event.target.value) {
      this.filesService.renameFolder(this.ListFolders[index].id, event.target.value).subscribe(
        res => {
          this.ListFolders[index].name = event.target.value;
          this.noti.showNotification('success', 'Rename folder success.');
        },
        error => {
          this.noti.showNotification('danger', 'Rename folder error.');
        }
      );
    }
  }

  clickOnNameChange() {
    setTimeout(() => {
      if (this.renameInput) {
        this.renameInput.nativeElement.focus();
        this.renameInput.nativeElement.setSelectionRange(0, this.renameInput.nativeElement.value.length);
      }
    }, 10);
  }

  openFolder(libID: string, encrypted: boolean) {
    console.log('hello there', this.typeRepo, libID);
    const type = encodeURI(this.router.url).split('/')[2];
    if (this.typeRepo.includes('group--')) {
      const idGroup = this.typeRepo.split('--')[1];
      this.router.navigate(['groups', idGroup, 'folders', libID]);
    } else {
      this.router.navigate(['folders', libID]);
    }
  }

  viewDetails(folder) {
    this.ClickModalAction.emit({ folder, 'action': 'viewDetails' });
    this.send(folder.id, Type.Details_Modal);
  }

  leaveShare(folder, index) {
    const path = `/?share_type=${folder.share_type}&from=${folder.owner}`;
    this.filesService.leaveShare(folder.id, path)
      .subscribe(resp => {
        const msg = resp.message === '' ? 'Leave shared success.' : resp.message;
        this.noti.showNotification('success', msg);
        this.unshared.emit();
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  isGroupList() {
    this.groupList = this.typeRepo && this.typeRepo.includes('group--');
  }

  unShare(folder) {
    if (this.typeRepo && this.typeRepo.includes('group--')) {
      this.groupsService.deleteRepoInGroup(this.typeRepo.split('--')[1], folder.id)
        .subscribe(resp => {
          const msg = resp.message === '' ? 'Unshared success.' : resp.message;
          this.noti.showNotification('success', msg);
          this.unshared.emit();
        }, error => {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
        });
    }
  }

  viewShareLinks(folder: FoldersModel, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'viewShareLink' });
    this.send(folder.id, Type.Share_Links_Modal);
  }

  unShareOrg(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal('unshare-org');
  }

  changeDesc(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal('change-desc');
  }

  handleOpenModal(type: string) {
    if (type === 'unshare-org') {
      this.openUnshareModal = true;
      this.openModal('#unshare-modal', () => this.openUnshareModal = false);
    } else if (type === 'change-desc') {
      this.isOpenModal.change_desc = true;
      this.openModal('#modal-edit-desc', () => this.isOpenModal.change_desc = false);
    }
  }

  openModal(idModal: string, detroyModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', detroyModal).modal('show'));
  }

  unshareCallBack(repoId: any) {
    this.filesService.deleteSharedRepos(repoId, 'public').subscribe(resps => {
      jQuery('#unshare-modal').modal('hide');
      this.noti.showNotification('success', resps.message);
      this.unshared.emit();
    }, error => {
      jQuery('#unshare-modal').modal('hide');
      this.noti.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  unSharedWithGroup(dataGroup: any) {
    this.groupsService.deleteRepoInGroup(dataGroup.groupid, dataGroup.id).subscribe(
      resps => {
        const msg = resps.message === '' ? 'Unshared success.' : resps.message;
        this.noti.showNotification('success', msg);
        this.unshared.emit();
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  handleChangeRangeSize() {
    const numberRangeSize = Number(this.rangeSize);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 110 && numberRangeSize < 150) {
      this.rangeTransformScale = (numberRangeSize + 20) / 100;
      this.classRangeSize = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
      this.rangeTransformScale = (numberRangeSize + 40) / 100;
      this.classRangeSize = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
    }
    this.rangeHeightPx = 100 * this.rangeTransformScale + 'px';
  }

  copyInternalLinkToClipboard(item) {
    this.clipboard.copyFromContent(`${window.location.href}/${item.id}`);
    this.noti.showNotification('success', this.translate.instant('NOTIFY_MSG.SUCCESS.INTERNAL_LINK_COPIED'));
  }
}
