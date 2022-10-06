
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';

import { map } from 'rxjs/operators';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService, OtherService, AuthenticationService, NotificationService, TitleService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ModalConfirmationComponent } from '@shared/components/modal-confirmation/modal-confirmation.component';
import { CookieService } from 'ngx-cookie';

import { AddMembersModalComponent } from '../../components/add-members-modal/add-members-modal.component';
import { BBBSettingModalComponent } from '@shared/components/bbb-setting-modal/bbb-setting-modal.component';

declare const jQuery: any;

@Component({
  selector: 'app-group-management',
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.scss']
})
export class GroupManagementComponent implements OnInit {

  @ViewChild(ModalConfirmationComponent) modalConfirmationComponent;

  bsModalRef: BsModalRef;

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  groupID: number;
  groupInfo: { [key: string]: any } = {};
  listMembersDisplay: Array<any> = [];
  displayedMembers = [];
  listMembersData: Array<any> = [];
  urlAvatarOwner: string;
  loggedUser: { [key: string]: any } = {};
  isOpenModal = {
    confirmation: false
  };
  params: any;
  modalConfirmation = {
    title: '',
    verify_question: '',
  };
  currentMember: any;
  editRoleIndex = -1;
  memberListToAdd: Array<any> = [];
  roleOptions = [];
  breadcrumbs = [];
  isListView = false;
  isProcessing = true;

  subscriptions: Subscription[] = [];

  pagination = {
    itemsPerPage: 30,
    page: 1,
  };

  maxSize = 5;

  typeModal = '';

  isShownSettingMenu = {
    'rename_group': false,
    'transfer_group': false,
    'import_members': false,
    'manageGroup': false,
    'dismiss': false,
    'leave': false,
    'bbb_setting': false,
  };

  isOpenSpecificGroupModal = {
    'dismiss_leave': false,
    'manage_group_members': false,
    'transfer_group': false,
    'rename_group': false,
    // 'import_group_members': false,
    'create_folder': false,
  };


  constructor(
    private activatedRoute: ActivatedRoute,
    private groupsService: GroupsService,
    private otherService: OtherService,
    private authSerive: AuthenticationService,
    private translate: TranslateService,
    private notify: NotificationService,
    private cookieService: CookieService,
    private router: Router,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private titleService: TitleService
  ) {
    this.activatedRoute.paramMap.subscribe(param => {
      this.groupID = Number(param.get('id'));
      this.initDataSelect();
      this.handleLoadData();
    });
  }

  ngOnInit() {
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  initDataSelect() {
    this.roleOptions = [
      {
        value: true,
        text: this.translate.instant('GROUP_MANAGEMENT.ROLE_ADMIN')
      },
      {
        value: false,
        text: this.translate.instant('GROUP_MANAGEMENT.ROLE_MEMBER')
      }
    ];
    this.exampleData = [
      {
        id: 'true',
        text: this.translate.instant('GROUP_MANAGEMENT.ROLE_ADMIN')
      },
      {
        id: 'false',
        text: this.translate.instant('GROUP_MANAGEMENT.ROLE_MEMBER')
      }
    ];
  }

  async handleLoadData() {
    this.groupInfo = await this.getGroupInfo();
    this.urlAvatarOwner = await this.getResizedAvatarOwner();
    this.getLoggedUser();
    await this.getMembers();
    this.handlePagination();
    this.handleBreadcrumbs();
    this.isProcessing = false;
    this.titleService.setTitle(
      [
        {
          str: this.groupInfo.name,
          translate: false
        },
        {
          str: "GROUP_MANAGEMENT.TITLE",
          translate: true
        }
      ]);
    // BBB config menu show or not
    this.isShownSettingMenu.bbb_setting = this.groupInfo.permissions.edit_bbb_config;
  }

  getGroupInfo(): Promise<any> {
    return new Promise((resolve) => this.groupsService.getGroupInfo(this.groupID).subscribe(resps => resolve(resps.data)));
  }

  getResizedAvatarOwner(): Promise<any> {
    return new Promise((resolve) => {
      this.otherService.getResizedAvatarUser(this.groupInfo.owner.email, '300').subscribe(resps => resolve(resps.url));
    });
  }

  getLoggedUser() {
    this.authSerive.userInfo().subscribe(resps => this.loggedUser = resps.data);
  }

  getMembers(): Promise<any> {
    return new Promise((resolve) => {
      this.groupsService.getMembersInGroup(this.groupID).subscribe(resps => {
        this.listMembersData = resps.data;
        this.updateListMembersDisplay();
        resolve();
      });
    });
  }

  handleOpenModal(typeModal: string) {
    this.typeModal = typeModal;
    if (typeModal === 'remove') {
      this.isOpenModal.confirmation = true;
      this.openModal('#modal-confirmation', () => this.isOpenModal.confirmation = false);
    } else if (typeModal === 'dismiss' || typeModal === 'leave') {
      this.isOpenSpecificGroupModal.dismiss_leave = true;
      this.openModal('#dismiss-leave-group-modal', () => this.isOpenSpecificGroupModal.dismiss_leave = false);
    } else if (typeModal === 'manageGroup') {
      this.isOpenSpecificGroupModal.manage_group_members = true;
      this.openModal('#manage-group-members', () => this.isOpenSpecificGroupModal.manage_group_members = false);
    } else if (typeModal === 'transfer-group') {
      this.isOpenSpecificGroupModal.transfer_group = true;
      this.openModal('#group-transfer', () => this.isOpenSpecificGroupModal.transfer_group = false);
    } else if (typeModal === 'rename-group') {
      this.isOpenSpecificGroupModal.rename_group = true;
      this.openModal('#group-rename', () => this.isOpenSpecificGroupModal.rename_group = false);
    } else if (typeModal === 'create-folder') {
      this.isOpenSpecificGroupModal.create_folder = true;
      this.openModal('#modal-create-folder', () => this.isOpenSpecificGroupModal.create_folder = false);
    }else if (typeModal === 'bbb-setting') {
      this.openBBBSettingModal();
    }
  }

  openModal(idModal: string, functionCloseModal) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  callbackDismissLeaveGroup() {
    jQuery('#dismiss-leave-group-modal').modal('hide');
    this.router.navigate(['manage', 'groups']);
  }

  renameGroupSuccess() {
    jQuery('#group-rename').modal('hide');
    this.handleLoadData();
  }

  transferGroupSuccess() {
    jQuery('#group-transfer').modal('hide');
    this.handleLoadData();
  }

  async requireRemoveMember(typeModal: string, dataMember) {
    this.currentMember = dataMember;
    this.modalConfirmation.title = await this.getModalTitleRemove(dataMember.name);
    this.modalConfirmation.verify_question = await this.getModalVerifyQuestion(dataMember.name);
    this.handleOpenModal(typeModal);
  }

  getModalTitleRemove(username): Promise<any> {
    return new Promise((resolve) => {
      this.translate.get('MODAL_CONFIRMATION.TITLES.REMOVE_USER_UNSTABLE', { username: username })
        .subscribe((res: string) => resolve(res));
    });
  }

  getModalVerifyQuestion(username): Promise<any> {
    return new Promise((resolve) => {
      this.translate.get('MODAL_CONFIRMATION.VERIFY_QUESTIONS.REMOVE_USER_UNSTABLE_LAST', { username: username })
        .subscribe((res: string) => resolve(res));
    });
  }

  async onRemoveMember() {
    await this.removeMember();
    await this.getMembers();
    this.handlePagination();
    this.modalConfirmationComponent.isProcessing = false;
    jQuery('#modal-confirmation').modal('hide');
  }

  removeMember(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.groupsService.removeGroupMemer(this.groupInfo.id, this.currentMember.email).subscribe(resps => {
        this.notify.showNotification('success', this.translate.instant('GROUP_MANAGEMENT.REMOVE_MEMBER_GROUP'));
        resolve();
      }, err => {
        this.notify.showNotification('danger', JSON.parse(err._body).message);
        resolve();
      });
    });
  }

  onFilterMember(value: string) {
    this.listMembersDisplay = this.listMembersData.filter(item => item.name.indexOf(value) !== -1);
  }

  updateListMembersDisplay() {
    this.listMembersDisplay = this.listMembersData;
  }

  changeRoleMember() {
    console.log('meomeo');
  }

  changeGroupMemberRole(member, isAdmin) {
    if (member.is_admin === isAdmin) {
      return;
    }
    this.groupsService.changeGroupMemberRole(this.groupInfo.id, member.email, isAdmin)
      .subscribe(async (resps) => {
        await this.getMembers();
        this.handlePagination();
        this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.CHANGE_GROUP_MEMBER_ROLE_SUCCESS'));
      }, err => this.notify.showNotification('danger', JSON.parse(err._body).message));
    this.editRoleIndex = -1;
  }

  onFocusOut() {
    setTimeout(() => this.editRoleIndex = -1, 100);
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.groupsService.searchUserForGroupManagement(this.groupInfo.id, text).pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: this.handleNameUserList(user.name),
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  handleNameUserList(nameStr: string, limitStr: number = 35) {
    const name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    return name;
  }

  addMemberToGroup() {
    if (this.memberListToAdd.length <= 0) {
      this.notify.showNotification('danger', this.translate.instant('GROUP_MANAGEMENT.YOU_MUST_SELECT_AT_LEAST_1_USER_TO_ADD_TO_THE_GROUP'));
      return;
    }
    const emailListToAdd = [];
    for (const entry of this.memberListToAdd) {
      emailListToAdd.push(entry.value);
    }
    this.groupsService.addMemberToGroupBulk(this.groupInfo.id, emailListToAdd).subscribe(async (resp) => {
      this.notify.showNotification('success', resp.message);
      this.memberListToAdd = [];
      await this.getMembers();
      this.handlePagination();
    }, err => {
      this.notify.showNotification('danger', 'Server error.');
    });
  }

  goToGroupFolder(groupID) {
    this.router.navigate(['/groups', groupID, 'folders']);
  }

  handleBreadcrumbs() {
    this.breadcrumbs = [];
    this.breadcrumbs.push({ name: this.translate.instant('GROUP_MANAGEMENT.TITLE'), path: ['/manage', 'groups'] });
    this.breadcrumbs.push({ name: this.groupInfo.name });
  }

  goBack() {
    this.router.navigate(['manage', 'groups']);
  }

  openAddMemberModal() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.handleLoadData();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    const initialState = {
      groupInfo: this.groupInfo,
    };
    this.bsModalRef = this.modalService.show(AddMembersModalComponent, { initialState });
  }

  async onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.listMembersDisplay.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    await this.getMembers();
    this.handlePagination();
  }

  async pageChanged(paginationData) {
    console.log('page changed event', paginationData);
    this.pagination = paginationData;
    await this.getMembers();
    this.handlePagination();
  }

  handlePagination() {
    const startItem = (this.pagination.page - 1) * this.pagination.itemsPerPage;
    const endItem = this.pagination.page * this.pagination.itemsPerPage;
    this.displayedMembers = this.listMembersDisplay.slice(startItem, endItem);
  }

  settingUserRole() {
    console.log('group members', this.listMembersData);
    console.log('group info', this.groupInfo);
    console.log('current user', this.loggedUser);

    let currentUserRoleInGroup = 'member';

    if (this.loggedUser.email === this.groupInfo.owner.email) {
      currentUserRoleInGroup = 'owner';
    } else if (this.groupInfo.admins.includes(this.loggedUser.email)) {
      currentUserRoleInGroup = 'admin';
    }
    this.setUserPermission(currentUserRoleInGroup);
  }

  setUserPermission(userRoleInGroup) {
    this.isShownSettingMenu.rename_group = (userRoleInGroup === 'owner' || userRoleInGroup === 'admin');
    this.isShownSettingMenu.transfer_group = (userRoleInGroup === 'owner');
    this.isShownSettingMenu.import_members = (userRoleInGroup === 'owner' || userRoleInGroup === 'admin');
    this.isShownSettingMenu.manageGroup = (userRoleInGroup === 'owner' || userRoleInGroup === 'admin');
    this.isShownSettingMenu.dismiss = (userRoleInGroup === 'owner');
    this.isShownSettingMenu.leave = (userRoleInGroup === 'member' || userRoleInGroup === 'admin');
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
        this.handleLoadData();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

  }

  openBBBSettingModal() {
    this.prepareModalSubscription();
    const initialState = {
      groupInfo: this.groupInfo
    };
    this.bsModalRef = this.modalService.show(BBBSettingModalComponent, { class: 'modal-md', initialState });
  }

}
