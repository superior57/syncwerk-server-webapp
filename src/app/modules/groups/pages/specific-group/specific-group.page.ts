
import {combineLatest as observableCombineLatest,  Observable ,  Subscription } from 'rxjs';

import {distinctUntilChanged, filter} from 'rxjs/operators';
import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { GroupsService, AuthenticationService, NotificationService, FilesService, MessageService } from '@services/index';
import { Action, Type } from '@enum/index.enum';
import { FoldersModel } from 'app/Models/Folder.model';
import { isEmpty, isImageDefault, sortByColumn, onChangeTable } from 'app/app.helpers';

import { ShareExistingFolderComponent } from '../../components/share-existing-folder/share-existing-folder.component';


declare var jQuery: any;

@Component({
  selector: 'app-specific-group',
  templateUrl: './specific-group.page.html',
  styleUrls: ['./specific-group.page.scss']
})

export class SpecificGroupPageComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  groupInfo: any; // Containing useful info for group management such as group admin, group owner. group id
  idGroup: number;
  listReposGroup;
  currentLoginUser;
  getCookieSortMode = this.cookieService.get('syc_sort_mode');
  isStaff: boolean;
  isOpenSpecificGroupModal = {
    'dismiss_leave': false,
    'manage_group_members': false,
    'transfer_group': false,
    'rename_group': false,
    // 'import_group_members': false,
    'create_folder': false,
  };
  isShownSettingMenu = {
    'rename_group': false,
    'transfer_group': false,
    'import_members': false,
    'manageGroup': false,
    'dismiss': false,
    'leave': false,
  };
  typeModal: string;
  membersGroup;
  isListView = this.cookieService.get('syc_view_mode') === 'list_view' ? true : false;
  isEmptyGroup = true;
  groupEmptyMessage = 'LIST_GROUPS.NO_FOLDER_TEXT';
  dataReloadCloseModal: { [key: string]: any } = Object;
  params: any;
  isProcessing = true;
  listRepoGroupDisplay: Array<any> = [];
  columns: Array<any> = [];
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

  constructor(
    private groupsService: GroupsService,
    private authService: AuthenticationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private cookieService: CookieService,
    private notiService: NotificationService,
    private filesService: FilesService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.idGroup = params.id;
      this.redirectToGroup();
    });
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),distinctUntilChanged(),)
      .subscribe((event) => {
        this.handleLoadData();
      });
  }

  ngOnInit() {
    this.initDataTable();
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  prepareModalSubscription() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.loadListRepoGroup();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  openModalShareExistingFolder() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ShareExistingFolderComponent, {
      class: 'modal-lg',
      initialState: {
        groupInfo: this.groupInfo
      }
    });
  }

  redirectToGroup() {
    this.getGroupGeneralInfo();
    this.loadListRepoGroup();
    this.getCurrentLoginUser();
  }

  initDataTable() {
    this.columns = [
      { title: 'TABLE.COLUMNS.NAME', name: 'name', width: '40%' },
      { title: 'TABLE.COLUMNS.SIZE', name: 'size', width: '15%', class: 'd-none d-lg-table-cell' },
      { title: 'TABLE.COLUMNS.LAST_UPDATE', name: 'mtime', width: '15%', class: 'd-none d-lg-table-cell' },
      { title: 'TABLE.COLUMNS.SHARED_BY', name: 'owner_nickname', width: '20%', class: 'd-none d-lg-table-cell' }
    ];
    this.config.sorting.columns = this.columns;
  }

  getCurrentLoginUser() {
    this.authService.userInfo().subscribe(resps => {
      this.currentLoginUser = resps.data;
      this.settingUserRole();
    }, error => console.error(error));
  }

  getGroupGeneralInfo() {
    this.groupsService.getGroupInfo(this.idGroup).subscribe(resps => this.groupInfo = resps.data);
  }

  async loadListRepoGroup() {
    await this.getListFolderInGroup();
    const data = onChangeTable(this.config, this.listReposGroup, this.columns, this.page);
    this.listRepoGroupDisplay = data.rows;
    this.length = data.length;
    this.isProcessing = false;
  }

  getListFolderInGroup(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.groupsService.getGroupRepos(this.idGroup)
        .subscribe(resps => {
          this.isStaff = resps.data.is_staff;
          this.listReposGroup = resps.data.repos;
          this.checkIsEmptyGroup();
          resolve();
        }, error => console.error(error));
    });
  }

  getMembersInGroup() {
    this.groupsService.getMembersInGroup(this.idGroup)
      .subscribe(resps => {
        this.membersGroup = resps.data;
        this.membersGroup.forEach(element => {
          element.isAvatarDefault = isImageDefault(element.avatar_url);
        });
      }, error => { });
  }

  checkIsEmptyGroup() {
    this.isEmptyGroup = isEmpty(this.listReposGroup);
  }

  reloadItemList() {
    this.redirectToGroup();
  }

  handleOpenModal(typeModal: string) {
    this.typeModal = typeModal;
    const isOpen = this.isOpenSpecificGroupModal;
    return new Promise((resolve, reject) => {
      try {
        if (typeModal === 'dismiss' || typeModal === 'leave') {
          isOpen.dismiss_leave = true;
          this.openModal('#dismiss-leave-group-modal', () => isOpen.dismiss_leave = false);
        } else if (typeModal === 'manageGroup') {
          isOpen.manage_group_members = true;
          this.openModal('#manage-group-members', () => isOpen.manage_group_members = false);
        } else if (typeModal === 'transfer-group') {
          isOpen.transfer_group = true;
          this.openModal('#group-transfer', () => isOpen.transfer_group = false);
        } else if (typeModal === 'rename-group') {
          isOpen.rename_group = true;
          this.openModal('#group-rename', () => isOpen.rename_group = false);
        } else if (typeModal === 'create-folder') {
          isOpen.create_folder = true;
          this.openModal('#modal-create-folder', () => isOpen.create_folder = false);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  openModal(idModal: string, destroyModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', destroyModal).modal('show'));
  }

  transferGroupSuccess() {
    jQuery('#group-transfer').modal('hide');
    this.getGroupGeneralInfo();
  }

  renameGroupSuccess() {
    jQuery('#group-rename').modal('hide');
    this.getGroupGeneralInfo();
    this.messageService.send(Type.Side_Menu_Bar_Component, Action.Reload_List_Groups, false);
  }

  handleLoadData() {
    this.messageService.send(Type.Child_Files_Component, Action.Open_Folder, false);
  }

  removeShareCallBack() {
    this.loadListRepoGroup();
  }

  revealMembers() {
    this.getMembersInGroup();
    jQuery('.scrollbar-outer').scrollbar();
  }

  settingUserRole() {
    this.groupsService.getMembersInGroup(this.idGroup)
      .subscribe(resps => {
        this.membersGroup = resps.data;
        this.membersGroup.forEach(element => {
          element.isAvatarDefault = isImageDefault(element.avatar_url);
        });
        let currentLoginUserRole = 'Member';
        if (this.currentLoginUser) {
          this.membersGroup.forEach((value) => {
            if (value.email === this.currentLoginUser.email) {
              currentLoginUserRole = value.role;
            }
          });
        }
        this.settingUserPermission(currentLoginUserRole);
      }, error => console.error(error));
  }

  settingUserPermission(role) {
    this.isShownSettingMenu.rename_group = (role === 'Owner' || role === 'Admin');
    this.isShownSettingMenu.transfer_group = (role === 'Owner');
    this.isShownSettingMenu.import_members = (role === 'Owner' || role === 'Admin');
    this.isShownSettingMenu.manageGroup = (role === 'Owner' || role === 'Admin');
    this.isShownSettingMenu.dismiss = (role === 'Owner');
    this.isShownSettingMenu.leave = (role === 'Member' || role === 'Admin');
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  callbackDismissLeaveGroup() {
    jQuery('#dismiss-leave-group-modal').modal('hide');
    this.router.navigate(['files', 'groups']);
  }

  routerMangeGroupPage() {
    this.router.navigate(['/manage', 'groups', this.groupInfo.id, 'group-management']);
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.listReposGroup, this.columns, page);
    this.listRepoGroupDisplay = data.rows;
    this.length = data.length;
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadListRepoGroup();
  }
}
