import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';

import { findIndex, sumBy } from 'lodash';

import { AdminService, NotificationService, AuthenticationService } from 'app/services';
import { sortByColumn, onChangeTable } from 'app/app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent implements OnInit {

  textDatabase;
  textAdmin;

  public roleSelectData: Array<Select2OptionData> = [];
  public statusSelectData: Array<Select2OptionData> = [
    {
      id: 'true',
      text: 'Active'
    },
    {
      id: 'false',
      text: 'Inactive'
    }
  ];
  public statusSelectDb: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  public perPageSelectData: Array<Select2OptionData> = [
    {
      id: '10',
      text: '10 Rows'
    },
    {
      id: '30',
      text: '30 Rows'
    },
    {
      id: '50',
      text: '50 Rows'
    },
    {
      id: '-1',
      text: 'Everything'
    }
  ];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  currentUser = '';
  adminList = [];
  userListForEdit = [];
  userListForDelete = [];
  userForResetPassword = '';
  userForRevoke = '';
  isCheckedAll = false;
  isModalOpen = {
    setQuota: false,
    deleteUser: false,
    resetPassword: false,
    revokeAdmin: false,
    addAdmins: false,
  };
  numberOfSelectedUsers = 0;
  isProcessing = true;
  params: any;
  adminListDisplay: Array<any> = [];
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
    private adminService: AdminService,
    private authService: AuthenticationService,
    private noti: NotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.get('ADMIN.USERS.TITLE.DATABASE').subscribe(database => this.textDatabase = database);
    this.translate.get('ADMIN.USERS.TITLE.ADMINS').subscribe(admin => this.textAdmin = admin);
    this.statusSelectDb = [
      {
        id: 'database',
        text: this.textDatabase
      },
      {
        id: 'admins',
        text: this.textAdmin
      }
    ];
    this.getAvailableRoles();
    this.getCurrentUserProfile();
    setTimeout(() => this.initDataTable());
  }

  getAvailableRoles() {
    this.adminService.getAvailableRoles().subscribe(resp => {
      this.roleSelectData = [];
      for (const role of resp.data) {
        let text;
        if (role.toLowerCase() === 'default') {
          text = this.translate.instant('ROLES.DEFAULT');
        } else if (role.toLowerCase() === 'super administrator') {
          text = this.translate.instant('ROLES.SUPER_ADMINISTRATOR');
        } else if (role.toLowerCase() === 'employee') {
          text = this.translate.instant('ROLES.EMPLOYEE');
        } else if (role.toLowerCase() === 'guest') {
          text = this.translate.instant('ROLES.GUEST');
        } else {
          text = role;
        }
        this.roleSelectData.push({
          id: role,
          text: text,
        });
      }
    });
  }

  getCurrentUserProfile() {
    this.authService.userInfo().subscribe(resp => {
      this.currentUser = resp.data.email;
    });
  }

  initDataTable() {
    this.columns = [
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.EMAIL') + ' / '
          + this.translate.instant('ADMIN.USERS.TABLE.NAME') + ' / '
          + this.translate.instant('ADMIN.USERS.TABLE.CONTACT_EMAIL'),
        name: 'email',
        width: '20%'
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.STATUS'),
        name: 'is_active',
        width: '11%'
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.ROLE'),
        name: 'role',
        width: '17%'
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.SPACE_USED') + ' / '
          + this.translate.instant('ADMIN.USERS.TABLE.QUOTA'),
        name: 'space_quota',
        width: '17%',
        sort: false
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.CREATED_AT') + ' / '
          + this.translate.instant('ADMIN.USERS.TABLE.LAST_LOGIN'),
        name: 'create_time',
        width: '16%',
        sort: false
      }
    ];
    this.config.sorting.columns = this.columns;
    this.loadData();
  }

  async loadData() {
    await this.getListAdmins();
    const data = onChangeTable(this.config, this.adminList, this.columns, this.page);
    this.adminListDisplay = data.rows;
    this.length = data.length;
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.adminList, this.columns, config, this.page);
    this.adminListDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.adminList, this.columns, page);
    this.adminListDisplay = data.rows;
    this.length = data.length;
  }

  async getListAdmins() {
    await this.getDataUsersAdmins();
    if (this.isProcessing) { this.waitingLoadData(); }
  }

  getDataUsersAdmins(): Promise<any> {
    return new Promise((resolve) => this.adminService.getListAdmin().subscribe(resps => {
      this.handleDataSuccessUserAdmins(resps);
      resolve();
    }));
  }

  handleDataSuccessUserAdmins(resps) {
    const resAdminList = resps.data.users;
    for (const user of resAdminList) {
      if (user.role.trim() === '') {
        user.role = user.is_guest ? 'guest' : 'default';
      }
      user.isEdit = false;
    }
    this.adminList = resAdminList;
  }

  waitingLoadData(): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(this.isProcessing = false), 200));
  }

  changeUserRole(user, role) {
    this.adminService.postChangeUserRole(user.email, role.value).subscribe(resp => {
      user.role = role.value;
      user.isEdit = false;
      user.editMode = '';
      this.noti.showNotification('success', resp.message);
    });
  }

  changeUserStatus(user, status) {
    const statusForRequest = status.value === 'true' ? '1' : '0';
    this.adminService.postChangeUserStatus(user.email, statusForRequest).subscribe(resp => {
      user.is_active = status.value === 'true' ? true : false;
      user.isEdit = false;
      user.editMode = '';
      this.noti.showNotification('success', resp.message);
    }, err => {

    });
  }

  setEditMode(user, mode) {
    user.isEdit = true;
    user.editMode = mode;
  }

  deactivateEditMode(user, event) {
    user.isEdit = false;
    user.editMode = '';
  }

  openSetQuotaModal(user) {
    this.userListForEdit = [];
    this.userListForEdit.push(user.email);
    this.handleOpenModal('setQuota');
  }

  openSetQuotaModalBatch() {
    this.userListForEdit = [];
    for (const user of this.adminList) {
      if (user.isChecked) {
        this.userListForEdit.push(user.email);
      }
    }
    this.handleOpenModal('setQuota');
  }

  openDeleteUserConfirmModal(user) {
    this.userListForDelete = [];
    this.userListForDelete.push(user.email);
    this.handleOpenModal('deleteUser');
  }

  openDeleteUsersModalBatch() {
    this.userListForDelete = [];
    for (const user of this.adminList) {
      if (user.isChecked) {
        if (user.email === this.currentUser) {
          this.noti.showNotification('danger', this.translate.instant('ADMIN.USERS.CANT_REMOVE_YOURSELF'));
          return;
        }
        this.userListForDelete.push(user.email);
      }
    }
    this.handleOpenModal('deleteUser');
  }

  openResetPasswordConfirmModal(user) {
    this.userForResetPassword = user.email;
    this.handleOpenModal('resetPassword');
  }

  openRevokeAdminConfirmModal(user) {
    if (user.email === this.currentUser) {
      this.noti.showNotification('danger', this.translate.instant('ADMIN.USERS.CANT_REVOKE_YOURSELF'));
    }
    this.userForRevoke = user.email;
    this.handleOpenModal('revokeAdmin');
  }

  handleOpenModal(typeModal: string) {
    switch (typeModal) {
      case 'setQuota':
        this.isModalOpen.setQuota = true;
        this.openModal('#set-quota-modal', () => this.isModalOpen.setQuota = false);
        break;
      case 'deleteUser':
        this.isModalOpen.deleteUser = true;
        this.openModal('#delete-user-confirm-modal', () => this.isModalOpen.deleteUser = false);
        break;
      case 'resetPassword':
        this.isModalOpen.resetPassword = true;
        this.openModal('#reset-password-confirm-modal', () => this.isModalOpen.resetPassword = false);
        break;
      case 'revokeAdmin':
        this.isModalOpen.revokeAdmin = true;
        this.openModal('#revoke-admin-confirm-modal', () => this.isModalOpen.revokeAdmin = false);
        break;
      case 'addAdmins':
        this.isModalOpen.addAdmins = true;
        this.openModal('#add-admins-modal', () => this.isModalOpen.addAdmins = false);
        break;
      default:
        break;
    }
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => {
      jQuery(idModal)
        .on('hidden.bs.modal', functionCloseModal)
        .modal('show');
    });
  }

  onSetQuotaSuccess(newInfo) {
    jQuery('#set-quota-modal').modal('hide');
    const indexForUpdate = findIndex(this.adminList, { email: newInfo.email });
    if (indexForUpdate >= 0) {
      this.adminList[indexForUpdate].space_quota = newInfo.total;
    }
  }

  onBatchSetQuotaSuccess(info) {
    jQuery('#set-quota-modal').modal('hide');
    for (const user of info.success) {
      const indexForUpdate = findIndex(this.adminList, { email: user.email });
      if (indexForUpdate >= 0) {
        this.adminList[indexForUpdate].space_quota = user.quota_total;
      }
    }
  }

  onUserDeleteSuccess(data) {
    for (const email of data.deletedUsers) {
      const indexForRemove = findIndex(this.adminList, { email: email });
      if (indexForRemove >= 0) {
        this.adminListDisplay.splice(indexForRemove, 1);
      }
    }
    jQuery('#delete-user-confirm-modal').modal('hide');
    this.noti.showNotification('success', data.message);
  }

  onBatchUserDeleteSuccess(info) {
    jQuery('#delete-user-confirm-modal').modal('hide');
    for (const user of info.success) {
      const indexForRemove = findIndex(this.adminList, { email: user.email });
      if (indexForRemove >= 0) {
        this.adminList.splice(indexForRemove, 1);
      }
    }
    this.countCheckedUser();
  }

  onResetPasswordSuccess(data) {
    jQuery('#reset-password-confirm-modal').modal('hide');
    this.noti.showNotification('success', data.message);
  }

  onRevokeAdminSuccess(data) {
    const indexForRemove = findIndex(this.adminList, { email: data.revokedUser });
    if (indexForRemove >= 0) {
      this.adminListDisplay.splice(indexForRemove, 1);
    }
    jQuery('#revoke-admin-confirm-modal').modal('hide');
    this.noti.showNotification('success', data.message);
  }

  onAddAdminsSuccess(data) {
    this.loadData();
    jQuery('#add-admins-modal').modal('hide');
    this.noti.showNotification('success', data.message);
  }


  countCheckedUser() {
    this.numberOfSelectedUsers = sumBy(this.adminList, user => user.isChecked ? 1 : 0);
  }

  handleCheckAll() {
    this.isCheckedAll = !this.isCheckedAll;
    if (this.isCheckedAll) {
      this.adminList.forEach(user => { user.isChecked = true; });
      this.countCheckedUser();
    } else {
      this.adminList.forEach(user => { user.isChecked = false; });
      this.countCheckedUser();
    }
  }

  handleCheck(user) {
    this.isCheckedAll = false;
    user.isChecked = !user.isChecked;
    this.countCheckedUser();
    if (user.isChecked && this.numberOfSelectedUsers === this.adminList.length) {
      this.isCheckedAll = true;
    }
  }

  changeDatabase(event) {
    this.router.navigate(['admin/users/' + event.value]);
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }
}
