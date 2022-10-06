import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { setTimeout } from 'core-js/library/web/timers';
import { GroupsService, AuthenticationService, NotificationService, MessageService, NonAuthenticationService } from '@services/index';
import { Router } from '@angular/router';
import { isEmpty, isImageDefault } from 'app/app.helpers';
import { Action, Type } from '@enum/index.enum';
import { forEach } from '@angular/router/src/utils/collection';
import { TranslateService } from '@ngx-translate/core';

// components

declare var jQuery: any;

@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.page.html',
  styleUrls: ['./groups-list.page.scss']
})
export class GroupsListPageComponent implements OnInit, AfterViewInit {
  openModal = {
    'new_group': false,
  };
  dataListGroups = [];
  displayedGroups = [];
  displayedGroupsLength = 0;
  filteredList = [];
  memberIconColor = [
    'bg-light-blue',
    'bg-red',
    'bg-amber',
    'bg-blue-grey',
    'bg-indigo',
    'bg-teal',
    'bg-cyan',
    'bg-brown',
    'bg-pink',
    'bg-green',
    'bg-grey'
  ];
  currentLoginUser;
  isShownSettingMenu = {
    'rename_group': false,
    'transfer_group': false,
    'import_members': false,
    'manageGroup': false,
    'dismiss': false,
    'leave': false,
  };
  isOpenSettingGroupModal = {
    'dismiss_leave': false,
    'manage_group_members': false,
    'transfer_group': false,
    'rename_group': false,
    'create_folder': false,
  };
  typeModal: string;
  loading = false;
  currentGroupInfo: { [key: string]: any } = Object;
  isProcessing = true;
  dataReloadCloseModal: { [key: string]: any } = Object;
  displayMembers = [];
  params: any;
  isListView = false;


  pagination = {
    itemsPerPage: 30,
    page: 1,
    totalItems: 0,
  };

  maxSize = 5;

  currentUserPermission: any = {
    can_add_group: false,
  };

  isGetGroupEnabled = false;

  // For slider
  rangeTransformScale: number;
  classRangeSize: string;
  rangeHeightPx: string;
  rangeSizeGrid;

  constructor(
    private groupsService: GroupsService,
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthenticationService,
    private notiService: NotificationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private nonAuthService: NonAuthenticationService
  ) {
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
   }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isGetGroupEnabled = resp.data.groups;
      if (!this.isGetGroupEnabled) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.authService.userInfo().subscribe(resp => {
      console.log(resp);
      this.currentUserPermission = resp.data.permissions;
    });
    // set the view type
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';

    // this.getCurrentLoginUser();
    this.authService.userInfo().subscribe(resps => {
      this.currentLoginUser = resps.data;
      this.getListGroups();
      this.messageService.subscribe(Type.Side_Menu_Bar_Component, (payload) => {
        switch (payload.action) {
          case Action.Reload_List_Groups:
            this.reloadList();
            break;
        }
      });
    }, error => console.error(error));
  }

  onChangeRangeSizeGrid(e) {
    this.rangeSizeGrid = e;
    this.handleChangeRangeSize();
    this.cookieService.put('syc_range_size', this.rangeSizeGrid);
  }

  ngAfterViewInit() {
    this.handleChangeRangeSize();
  }

  reloadList() {
    this.reloadListGroupCloseModal();
    this.getListGroups();
    this.sortListByName(this.dataListGroups);
    this.handlePagination();
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  getListGroups() {
    this.groupsService.getListGroups()
      .subscribe(resps => {
        this.handleDisplayMembers(resps.data);
        this.dataListGroups = resps.data;
        this.filteredList = Object.assign([], resps.data);
        this.dataListGroups.forEach((item, index) => {
          this.handleGroupListPermission(index);
        });
        this.sortListByName(this.dataListGroups);
        this.handlePagination();
        this.isProcessing = false;
      }, error => console.error(error));

  }

  handleGroupListPermission(index) {
    const operationsPermission = {
      rename_group: false,
      transfer_group: false,
      manage_group: false,
      dismiss: false,
      leave: false
    };
    let role = 'member';
    if (this.dataListGroups[index].owner.email === this.currentLoginUser.email) {
      role = 'owner';
    } else if (this.dataListGroups[index].admins.includes(this.currentLoginUser.email)) {
      role = 'admin';
    }

    switch (role) {
      case 'owner':
        operationsPermission.rename_group = true;
        operationsPermission.transfer_group = true;
        operationsPermission.manage_group = true;
        operationsPermission.dismiss = true;
        operationsPermission.leave = false;
        break;
      case 'admin':
        operationsPermission.rename_group = true;
        operationsPermission.transfer_group = false;
        operationsPermission.manage_group = true;
        operationsPermission.dismiss = false;
        operationsPermission.leave = true;
        break;
      default:
        operationsPermission.rename_group = false;
        operationsPermission.transfer_group = false;
        operationsPermission.manage_group = false;
        operationsPermission.dismiss = false;
        operationsPermission.leave = true;
        break;
    }

    this.dataListGroups[index].permission = operationsPermission;
  }

  handleDisplayMembers(dataGroups) {
    for (let pos_group = 0; pos_group <= dataGroups.length - 1; pos_group++) {
      const listMembers = dataGroups[pos_group].members;
      if (listMembers.length < 5) {
        for (let j = 1; j <= 4 - dataGroups[pos_group].members_count; j++) {
          listMembers.push({
            member_empty: true,
            class: 'icon-empty',
            avatar_url: '../assets/images/group_empty.jpg'
          });
        }
        for (let pos_member = 0; pos_member < listMembers.length; pos_member++) {
          if (listMembers[pos_member].avatar_url.includes('default.png')) {
            const dataColorDisplayMember = this.setColorDisplayMemberDefault(listMembers[pos_member]);
            listMembers[pos_member].name_initial = dataColorDisplayMember.name_initial;
            listMembers[pos_member].icon_color = dataColorDisplayMember.icon_color;
          }
        }
      }
    }
  }

  setColorDisplayMemberDefault(member) {
    const nameInitial = member.name.toLowerCase().charAt(0);
    let colorCode = nameInitial.charCodeAt(0) - 97;
    colorCode = (colorCode >= 0 && colorCode <= 25) ? colorCode % 10 : this.memberIconColor.length - 1;
    return { name_initial: nameInitial, icon_color: this.memberIconColor[colorCode] };
  }

  getCurrentLoginUser() {
    this.authService.userInfo().subscribe(resps => {
      this.currentLoginUser = resps.data;
    }, error => console.error(error));
  }

  sortListByName(list) {
    const listSort = list.sort((a, b) => {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      return 0;
    });
    return listSort;
  }

  createNewGroup() {
    this.openModal.new_group = true;
    this.handleOpenModal();
  }

  handleOpenModal() {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => jQuery('#modal-create-new-group')
          .on('hidden.bs.modal', () => this.openModal.new_group = false)
          .modal('show'));
      } catch (e) { reject(e); }
    });
  }

  handleCloseModal(event) {
    this.openModal.new_group = event;
  }

  handleAddGroupToList(messageSuccess: string) {
    this.getListGroups();
    const lastItem = this.dataListGroups.pop();
    this.dataListGroups.unshift(lastItem);
    jQuery('#modal-create-new-group').modal('hide');
    // this.notiService.showNotification('success', messageSuccess);
    this.notiService.showNotification('success', this.translate.instant('GROUP_MANAGEMENT.CREATE_GROUP'));
    this.handlePagination();
  }

  getGroupGeneralInfo(idGroup) {
    this.groupsService.getGroupInfo(idGroup).subscribe(resps => this.currentGroupInfo = resps.data);
  }

  settingUserRole(index) {
    const groupId = this.dataListGroups[index].id;
    this.resetUserPermission();
    this.getGroupGeneralInfo(groupId);
    this.loading = true;
    this.groupsService.getMembersInGroup(groupId)
      .subscribe(resps => {
        this.dataListGroups[index]['memberList'] = resps.data;
        let currentLoginUserRole = 'Member';
        if (this.currentLoginUser) {
          this.dataListGroups[index]['memberList'].forEach((value) => {
            if (value.email === this.currentLoginUser.email) {
              currentLoginUserRole = value.role;
            }
          });
        }
        this.settingUserPermission(currentLoginUserRole);
        this.loading = false;
      }, error => console.error(error));
  }

  settingUserPermission(role) {
    this.isShownSettingMenu.rename_group = (role === 'Owner' || role === 'Admin');
    this.isShownSettingMenu.transfer_group = (role === 'Owner');
    this.isShownSettingMenu.manageGroup = (role === 'Owner' || role === 'Admin');
    this.isShownSettingMenu.dismiss = (role === 'Owner');
    this.isShownSettingMenu.leave = (role === 'Member' || role === 'Admin');
  }

  resetUserPermission() {
    this.isShownSettingMenu.rename_group = false;
    this.isShownSettingMenu.transfer_group = false;
    this.isShownSettingMenu.manageGroup = false;
    this.isShownSettingMenu.dismiss = false;
    this.isShownSettingMenu.leave = false;
  }

  reloadListGroup(data: any) {
    this.getListGroups();
    this.dataReloadCloseModal = data;
  }

  reloadListGroupCloseModal() {
    if (this.dataReloadCloseModal.type_modal === 'dismiss-leave-group') {
      jQuery('#dismiss-leave-group-modal').modal('hide');
    }
  }

  handleBounceModal(typeModal: string) {
    const isOpen = this.isOpenSettingGroupModal;
    if (typeModal === 'dismiss' || typeModal === 'leave') {
      isOpen.dismiss_leave = true;
    } else if (typeModal === 'manageGroup') {
      isOpen.manage_group_members = true;
    } else if (typeModal === 'transfer-group') {
      isOpen.transfer_group = true;
    } else if (typeModal === 'rename-group') {
      isOpen.rename_group = true;
    } else if (typeModal === 'create-folder') {
      isOpen.create_folder = true;
    }
  }

  handleOpenSettingModal(typeModal: string, selectedGroup) {
    this.currentGroupInfo = selectedGroup;
    this.typeModal = typeModal;
    const isOpen = this.isOpenSettingGroupModal;
    this.handleBounceModal(typeModal);
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          if (typeModal === 'dismiss' || typeModal === 'leave') {
            this.openSettingModal('#dismiss-leave-group-modal', () => isOpen.dismiss_leave = false);
          } else if (typeModal === 'manageGroup') {
            this.openSettingModal('#manage-group-members', () => isOpen.manage_group_members = false);
          } else if (typeModal === 'transfer-group') {
            this.openSettingModal('#group-transfer', () => isOpen.transfer_group = false);
          } else if (typeModal === 'rename-group') {
            this.openSettingModal('#group-rename', () => isOpen.rename_group = false);
          } else if (typeModal === 'create-folder') {
            this.openSettingModal('#modal-create-folder', () => isOpen.create_folder = false);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  openSettingModal(idModal: string, destroyModal: any) {
    jQuery(idModal)
      .on('hidden.bs.modal', destroyModal)
      .modal('show');
  }

  transferGroupSuccess() {
    jQuery('#group-transfer')
      .modal('hide');
    this.getListGroups();
    this.handlePagination();
  }

  renameGroupSuccess() {
    jQuery('#group-rename')
      .modal('hide');
    this.getListGroups();
    this.handlePagination();
    this.messageService.send(Type.Side_Menu_Bar_Component, Action.Reload_List_Groups, false);
  }

  importMembersSuccess() {
    jQuery('#import-group-members')
      .modal('hide');
    this.getListGroups();
    this.handlePagination();
  }

  routerManageGroupPage(groupID) {
    this.router.navigate(['/manage', 'groups', groupID, 'group-management']);
  }

  onPerPageChanged(data) {
    console.log('per page changed. Need to implement this');
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.dataListGroups.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    // this.getListGroups();
    // this.sortListByName(this.dataListGroups);
    this.handlePagination();
  }

  pageChanged(paginationData) {
    console.log('page changed event', event);
    this.pagination = paginationData;
    // this.getListGroups();
    // this.sortListByName(this.dataListGroups);
    this.handlePagination();
  }

  handlePagination() {
    const startItem = (this.pagination.page - 1) * this.pagination.itemsPerPage;
    const endItem = this.pagination.page * this.pagination.itemsPerPage;
    this.displayedGroups = this.filteredList.slice(startItem, endItem);
    this.displayedGroupsLength = this.displayedGroups.length;
  }

  onSearchFilterChange(e) {
    this.pagination.page = 1;
    const filterValue = e.target.value.toLowerCase().trim();
    if (filterValue === '') {
      this.getListGroups();
    } else {
      this.filteredList = this.dataListGroups.filter(group => group.name.toLowerCase().trim().includes(filterValue));
      this.handlePagination();
    }
  }

  handleChangeRangeSize() {
    const numberRangeSize = Number(this.rangeSizeGrid);
    if (numberRangeSize >= 100 && numberRangeSize < 116) {
      this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 116 && numberRangeSize <= 160) {
      this.rangeTransformScale = 116 / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    }
    this.rangeHeightPx = 100 * this.rangeTransformScale + 'px';
  }
}
