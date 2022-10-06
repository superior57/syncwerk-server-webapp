import {
  Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';

import { AppConfig } from 'app/app.config';
import { isEmpty, getTypeRepoFromRoute } from 'app/app.helpers';
import { Action, Type } from '@enum/index.enum';
import { FoldersModel } from 'app/Models/Folder.model';
import {
  FilesService,
  MessageService,
  AuthenticationService,
  NotificationService,
  GroupsService
} from '@services/index';
import { ClipboardService } from 'ngx-clipboard';
import { TranslateService } from '@ngx-translate/core';
import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { Select2OptionData } from 'ng2-select2';
import { count } from 'rxjs/operators';

declare var jQuery: any;

@Component({
  selector: 'app-root-list-view',
  templateUrl: './root-list-view.component.html',
  styleUrls: ['./root-list-view.component.scss']
})
export class RootListViewComponent implements OnInit {
  private subscription: Subscription;
  @Input() listFolders = [];
  @Input() isStaff: boolean;
  @Input() typeRepo: string = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
  @Input() columns = [];
  @Output() ClickModalAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() unshared = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<any>();
  @Output() sorted = new EventEmitter<any>();

  @ViewChild('renameInput') renameInput: ElementRef;
  @ViewChild('editDescriptionInput') editDescriptionInput: ElementRef;

  public perPageSelectData: Array<Select2OptionData> = [];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  rename;
  editDescription;
  libNameRegex = /^[^~#%*/\\:<>?|".]*$/;
  emptyList = true;
  groupList = false;
  openUnshareModal = false;
  isProcessingUnshare: boolean;
  currentItem: any;
  model = {
    change_name: '',
    change_description: '',
  };

  constructor(
    private filesService: FilesService,
    private appConfig: AppConfig,
    private noti: NotificationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private groupsService: GroupsService,
    private translate: TranslateService,
    private clipboard: ClipboardService,
  ) { }

  ngOnInit() {
    this.isEmpty();
    this.isGroupList();
  }

  send(folderId: string, type: any) {
    const payload = {
      type: type,
      folderId: folderId,
      repoType: 'folder'
    };
    this.messageService.broadcast(type, payload);
  }

  removeFolder(folder: any, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'delete' });
  }

  shareFolder(folder: any, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'shared' });
  }

  transferFolder(folder: any, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'transferFolder' });
    this.send(folder.id, Type.Transfer_Folder_Modal);
  }

  historySetting(folder: any, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'historySetting' });
    this.send(folder.id, Type.History_Setting_Modal);
  }

  changePassword(folder: any, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'changePassword' });
    this.send(folder.id, Type.Change_Password_Modal);
  }

  onKeyPress(event) {
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !this.libNameRegex.test(inputChar)) {
      event.preventDefault();
    }
  }

  changeName(dataItem: any) {
    this.rename = -1;
    if (this.model.change_name.length <= 0) {
      this.noti.showNotification('danger', 'Folder name is required.');
      return;
    }
    if (!this.libNameRegex.test(this.model.change_name)) {
      this.noti.showNotification('danger', 'Invalid folder name.');
      return;
    }
    if (dataItem.name !== this.model.change_name) {
      this.filesService.renameFolder(dataItem.id, this.model.change_name, dataItem.desc)
        .subscribe(resp => {
          this.refresh.emit();
          this.noti.showNotification('success', 'Rename folder success.');
        }, error => {
          this.noti.showNotification('danger', 'Rename folder error.');
        });
    }
  }

  changeDescription(dataItem: any) {
    this.editDescription = -1;
    if (dataItem.desc !== this.model.change_description) {
      this.filesService.renameFolder(dataItem.id, dataItem.name, this.model.change_description)
        .subscribe(resp => {
          this.refresh.emit();
          this.noti.showNotification('success', this.translate.instant('MODAL_EDIT_FOLDER_DESCRIPTION.EDIT_SUCCESSFULLY'));
        }, error => {
          this.noti.showNotification('danger', this.translate.instant('MODAL_EDIT_FOLDER_DESCRIPTION.EDIT_FAILED'));
        });
    }
  }

  triggerNameChange(r) {
    // const el: HTMLElement = this.renameInput.nativeElement as HTMLElement;
    // const ev = new KeyboardEvent('keyup', { key: 'enter', code: '13' });
    // el.dispatchEvent(ev);
    this.changeName(r);
  }

  triggerDescriptionChange() {
    const el: HTMLElement = this.editDescriptionInput.nativeElement as HTMLElement;
    const ev = new KeyboardEvent('keyup', { key: 'enter', code: '13' });
    el.dispatchEvent(ev);
  }

  clickOnNameChange(name: string) {
    this.model.change_name = name;
    setTimeout(() => {
      if (this.renameInput) {
        this.renameInput.nativeElement.focus();
        this.renameInput.nativeElement.setSelectionRange(0, this.renameInput.nativeElement.value.length);
      }
    });
  }

  clickOnEditDescription(description: string) {
    this.model.change_description = description;
    setTimeout(() => {
      if (this.editDescriptionInput) {
        this.editDescriptionInput.nativeElement.focus();
        this.editDescriptionInput.nativeElement.setSelectionRange(0, this.editDescriptionInput.nativeElement.value.length);
      }
    });
  }

  openFolder(libID: string, encrypted: boolean) {
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

  leaveShare(folder) {
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

  unShareGroup(folder) {
    if (this.typeRepo && this.typeRepo.includes('group')) {
      this.groupsService.deleteRepoInGroup(this.typeRepo.split('--')[1], folder.id)
        .subscribe(resp => {
          const msg = resp.message === '' ? 'Unshared success.' : resp.message;
          this.noti.showNotification('success', this.translate.instant('MODAL_SHARE.UNSHARE_NOTIFICATIONS'));
          this.unshared.emit();
        }, error => {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
        });
    }
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

  unShareOrg(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal();
  }

  isEmpty() {
    this.emptyList = isEmpty(this.listFolders);
  }

  isSharedList() {
    return this.typeRepo && this.typeRepo.includes('shared');
  }
  isGroupList() {
    this.groupList = this.typeRepo && this.typeRepo.includes('group--');
  }

  handleOpenModal() {
    this.openUnshareModal = true;
    setTimeout(() => this.openModal('#unshare-modal', () => this.openUnshareModal = false));
  }

  openModal(idModal: string, detroyModal: any) {
    jQuery(idModal).on('hidden.bs.modal', detroyModal).modal('show');
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

  viewShareLinks(folder: FoldersModel, index) {
    this.ClickModalAction.emit({ folder, index, 'action': 'viewShareLink' });
    this.send(folder.id, Type.Share_Links_Modal);
  }

  sortColumnSelected(column) {
    this.sorted.emit(column);
  }

  copyInternalLinkToClipboard(item) {
    this.clipboard.copyFromContent(`${window.location.href}/${item.id}`);
    this.noti.showNotification('success', this.translate.instant('NOTIFY_MSG.SUCCESS.INTERNAL_LINK_COPIED'));
  }

}
