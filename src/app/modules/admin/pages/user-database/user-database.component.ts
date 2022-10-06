import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';

import { AdminService, NotificationService, AuthenticationService, NonAuthenticationService } from 'app/services';
import { sortByColumn, onChangeTable } from 'app/app.helpers';

import { findIndex, sumBy } from 'lodash';
import { query } from '@angular/animations';

declare var jQuery: any;

@Component({
  selector: 'app-user-database',
  templateUrl: './user-database.component.html',
  styleUrls: ['./user-database.component.scss']
})
export class UserDatabaseComponent implements OnInit {

  bigTotalItems = 0;
  perPage = 1;
  textDatabase;
  textAdmin;

  public roleSelectData: Array<Select2OptionData> = [];
  public statusSelectData: Array<Select2OptionData> = [
    {
      id: 'true',
      text: this.translate.instant('ADMIN.USERS.STATUS.ACTIVE')
    },
    {
      id: 'false',
      text: this.translate.instant('ADMIN.USERS.STATUS.INACTIVE')
    }
  ];

  public tenantOptionList: Array<Select2OptionData> = [
  ];

  public statusSelectDb: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  public perPageSelectData: Array<Select2OptionData> = [
    { id: '10', text: '10 Rows' },
    { id: '30', text: '30 Rows' },
    { id: '50', text: '50 Rows' },
    { id: '-1', text: 'Everything' }
  ];

  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  hasNextPage = false;
  isLoadingInProgress = true;
  userList = [];
  userListForEdit = [];
  userListForDelete = [];
  userForResetPassword = '';
  currentUser = '';
  isModalOpen = {
    setQuota: false,
    deleteUser: false,
    resetPassword: false,
    addImportUsers: false,
  };
  isCheckedAll = false;
  numberOfSelectedUsers = 0;
  isProcessing = true;
  params: any;
  userListDisplay: Array<any> = [];
  columns: Array<any> = [];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };
  page: any = {
    page: 1,
    itemsPerPage: '10'
  };
  maxSize = 5;
  numPages = 1;
  length = 0;

  avaliableAdminRoles = [];
  avaliableUserRoles = [];

  currentUserPermission: any = {
    can_manage_user: false,
  };

  DatabaseSource = 'DB';
  LDAPSource = 'LDAPImport';

  enableDatabaseSource = false;
  enableLDAPSource = false;

  // Set default source is database
  source = this.DatabaseSource;

  enableResetPassword = true;

  isEnabledAdminArea = false;

  constructor(
    private adminService: AdminService,
    private noti: NotificationService,
    private authService: AuthenticationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService,
    private translate: TranslateService,
    private nonAuthService: NonAuthenticationService
  ) { }

  ngOnInit() {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminArea = resp.data.admin_area;
      if (!this.isEnabledAdminArea) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.adminService.getListTenant().subscribe(resp => {
      console.log('thjis is tenant list', resp);
      for (const tenant of resp.data.insts) {
        const tenantOptionEntry = {
          text: tenant.name,
          id: tenant.name
        };
        this.tenantOptionList.push(tenantOptionEntry);
      }
      this.tenantOptionList.unshift({
        text: '--',
        id: ''
      });
    });

    this.adminService.getListUserSource().subscribe(resps => {
      // Check database source exist
      if (resps.data.indexOf(this.DatabaseSource) >= 0){
        this.enableDatabaseSource = true;
      }

      // Check LDAP source exist
      if (resps.data.indexOf(this.LDAPSource) >= 0){
        this.enableLDAPSource = true;
      }
    });

    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;
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
      this.activatedRoute.queryParams.subscribe(params => {
        console.log('query params', params);
        this.config.filtering.filterString = params.email ? params.email : '';
        setTimeout(() => this.initDataTable());
      });
    });
  }

  getAvailableRoles() {
    this.adminService.getAvailableRoles().subscribe(resp => {
      const roleOptions = [];

      this.avaliableAdminRoles = resp.data.admin_roles;
      this.avaliableUserRoles = resp.data.user_roles;

      // Populate admin roles
      const adminRolesOptionGroup = {
        id: 'admin_role',
        text: this.translate.instant('ROLES.ADMIN_ROLES'),
        disabled: true,
        children: [],
      };
      for (const role of resp.data.admin_roles) {
        adminRolesOptionGroup.children.push({
          id: role,
          text: role,
          isAdminRole: true,
        });
      }
      // User Roles
      const userRolesOptionsGroup = {
        id: 'user_roles',
        text: this.translate.instant('ROLES.USER_ROLES'),
        disabled: true,
        children: [],
      };

      for (const role of resp.data.user_roles) {
        userRolesOptionsGroup.children.push({
          id: role,
          text: role,
          isAdminRole: false,
        });
      }

      roleOptions.push(adminRolesOptionGroup);
      roleOptions.push(userRolesOptionsGroup);

      this.roleSelectData = roleOptions;
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
        width: '20%',
        class: ''
      },
      {
        title: 'Admin status (hidden)',
        name: 'status',
        width: '0',
        class: 'd-none'
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.STATUS'),
        name: 'is_active',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.ROLE'),
        name: 'role',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.TENANT'),
        name: 'role',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.SPACE_USED') + ' / '
          + this.translate.instant('ADMIN.USERS.TABLE.QUOTA'),
        name: 'space_quota',
        width: '10%',
        class: 'd-none d-lg-table-cell'
        // sort: false
      },
      {
        title: this.translate.instant('ADMIN.USERS.TABLE.CREATED_AT') + ' / '
          + this.translate.instant('ADMIN.USERS.TABLE.LAST_LOGIN'),
        name: 'create_time',
        width: '20%',
        class: 'd-none d-lg-table-cell'
        // sort: false
      }
    ];
    this.config.sorting.columns = this.columns;
    this.loadData();
  }

  changeSource(source: string = this.source){
    this.source = source;
    if (source == this.LDAPSource){
      this.enableResetPassword = false;
    } else {
      this.enableResetPassword = true;
    }
    this.numberOfSelectedUsers = 0;
    this.isCheckedAll = false;
  }

  async loadData(source: string = this.source) {
    this.changeSource(source);
    await this.getDataUsersDatabases();
    const data = onChangeTable(this.config, this.userList, this.columns, this.page);
    this.userListDisplay = data.rows;
    this.length = data.length;
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.userList, this.columns, config, this.page);
    this.userListDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.userList, this.columns, page);
    this.userListDisplay = data.rows;
    this.length = data.length;
  }

  getDataUsersDatabases(): Promise<any> {
    return new Promise((resolve) => this.adminService.getListDatabaseUser('',this.source, -1, -1).subscribe(resps => {
      this.handleDataSuccessUsersDatabases(resps);
      this.isProcessing = false;
      resolve();
    }));
  }

  handleDataSuccessUsersDatabases(resps) {
    const resUserList = resps.data.users;
    for (const user of resUserList) {
      // user.role = user.is_default ? 'default' : user.is_guest ? 'guest' : user.role;
      user.isEdit = false;
      user.status = user.is_active ? this.translate.instant('ADMIN.USERS.STATUS.ACTIVE') : this.translate.instant('ADMIN.USERS.STATUS.INACTIVE');
    }
    this.userList = resUserList;
    this.hasNextPage = resps.data.page_next;
    this.bigTotalItems = resps.data.number_of_total_users;
    this.isLoadingInProgress = false;
  }

  changeUserRole(user, role, index) {
    const selectedRole = role.data[0];
    if (selectedRole.isAdminRole === true) {
      this.adminService.postAddAdmins([user.email]).subscribe(reps => {
        this.userListDisplay[index].is_staff = true;
        this.adminService.postChangeUserRole(user.email, selectedRole.id).subscribe(resp => {
          user.role = selectedRole.id;
          user.isEdit = false;
          user.editMode = '';
          this.noti.showNotification('success', this.translate.instant('ROLES.USER_ROLES_CHANGE_SUCCESS'));
        });
      });
    } else {
      this.adminService.postRevokeAdmin(user.email).subscribe(reps => {
        this.userListDisplay[index].is_staff = false;
        this.adminService.postChangeUserRole(user.email, selectedRole.id).subscribe(resp => {
          user.role = selectedRole.id;
          user.isEdit = false;
          user.editMode = '';
          this.noti.showNotification('success', resp.message);
        });
      });
    }
  }

  changeUserStatus(user, status) {
    const statusForRequest = status.value === 'true' ? '1' : '0';
    this.adminService.postChangeUserStatus(user.email, statusForRequest).subscribe(resp => {
      user.is_active = status.value === 'true' ? true : false;
      user.isEdit = false;
      user.editMode = '';
      if (status.value === 'true') {
        this.noti.showNotification('success', this.translate.instant('ROLES.ACTIVATE_USER_SUCCESS'));
      } else {
        this.noti.showNotification('success', this.translate.instant('ROLES.DEACTIVATE_USER_SUCCESS'));
      }
    }, err => {
      const errorObj = JSON.parse(err._body);
      console.log(errorObj);
      this.noti.showNotification('danger', errorObj.message);
      if (errorObj.data && errorObj.data.show_upgrade_modal) {
        this.handleOpenModal('addImportUsers');
      }
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

  exportToExcel() {
    this.adminService.getExportDatabaseUserListToExcel().subscribe(resp => {
      window.location.href = resp.url;
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  openSetQuotaModal(user) {
    this.userListForEdit = [];
    this.userListForEdit.push(user.email);
    this.handleOpenModal('setQuota');
  }

  openSetQuotaModalBatch() {
    this.userListForEdit = [];
    for (const user of this.userList) {
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
    for (const user of this.userList) {
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
      case 'addImportUsers':
        this.isModalOpen.addImportUsers = true;
        this.openModal('#add-import-users-modal', () => this.isModalOpen.addImportUsers = false);
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
    const indexForUpdate = findIndex(this.userList, { email: newInfo.email });
    if (indexForUpdate >= 0) {
      this.userList[indexForUpdate].space_quota = newInfo.total;
    }
  }

  onBatchSetQuotaSuccess(info) {
    jQuery('#set-quota-modal').modal('hide');
    for (const user of info.success) {
      const indexForUpdate = findIndex(this.userList, { email: user.email });
      if (indexForUpdate >= 0) {
        this.userList[indexForUpdate].space_quota = user.quota_total;
      }
    }
  }

  onUserDeleteSuccess(data) {
    for (const email of data.deletedUsers) {
      const indexForRemove = findIndex(this.userList, { email: email });
      if (indexForRemove >= 0) {
        this.userList.splice(indexForRemove, 1);
      }
      const displayedIndexForRemove = findIndex(this.userListDisplay, {email: email});
      if (displayedIndexForRemove >= 0) {
        this.userListDisplay.splice(displayedIndexForRemove, 1);
      }
    }
    this.countCheckedUser();
    jQuery('#delete-user-confirm-modal').modal('hide');
    this.noti.showNotification('success', data.message);
  }

  onBatchUserDeleteSuccess(info) {
    jQuery('#delete-user-confirm-modal').modal('hide');
    for (const user of info.success) {
      const indexForRemove = findIndex(this.userList, { email: user.email });
      if (indexForRemove >= 0) {
        this.userList.splice(indexForRemove, 1);
        this.loadData();
      }
    }
    this.countCheckedUser();
  }

  onResetPasswordSuccess(data) {
    jQuery('#reset-password-confirm-modal').modal('hide');
    this.noti.showNotification('success', data.message);
  }

  onAddUserSuccess(data) {
    jQuery('#add-import-users-modal').modal('hide');
    this.noti.showNotification('success', data.message);
    this.userList = [];
    this.userListForDelete = [];
    this.userListForEdit = [];
    this.loadData();
  }


  countCheckedUser() {
    this.numberOfSelectedUsers = sumBy(this.userList, user => user.isChecked ? 1 : 0);
  }

  handleCheckAll() {
    this.isCheckedAll = !this.isCheckedAll;
    if (this.isCheckedAll) {
      this.userListDisplay.forEach(user => { user.isChecked = true; });
      this.countCheckedUser();
    } else {
      this.userListDisplay.forEach(user => { user.isChecked = false; });
      this.countCheckedUser();
    }
  }

  handleCheck(user) {
    this.isCheckedAll = false;
    user.isChecked = !user.isChecked;
    this.countCheckedUser();
    if (user.isChecked && this.numberOfSelectedUsers === this.userList.length) {
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

  onPromoteAdmin(user, index) {
    this.adminService.postAddAdmins([user.email]).subscribe(reps => {
      this.adminService.postChangeUserRole(user.email, this.avaliableAdminRoles[0]).subscribe(resp2 => {
        this.userListDisplay[index].is_staff = true;
        this.userListDisplay[index].role = this.avaliableAdminRoles[0];
      });
    });
  }
  onDemoteAdmin(user, index) {
    this.adminService.postRevokeAdmin(user.email).subscribe(reps => {
      this.adminService.postChangeUserRole(user.email, this.avaliableUserRoles[0]).subscribe(resp2 => {
        this.userListDisplay[index].is_staff = false;
        this.userListDisplay[index].role = this.avaliableUserRoles[0];
      });
    });
  }

  onChangeTenant(user, selectedTenant, index) {
    console.log(selectedTenant);
    this.adminService.putCreateUpdateAccount(user.email, {
      tenant: selectedTenant.value === '--' ? '' : selectedTenant.value
    }).subscribe(resp => {
      user.isEdit = false;
      user.editMode = '';
      this.noti.showNotification('success', this.translate.instant('ADMIN.USERS.UPDATE_TENANT_SUCCESSFULLY'));
      this.loadData();
    });
  }
}
