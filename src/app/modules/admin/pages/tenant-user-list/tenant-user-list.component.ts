
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AdminService, NotificationService, NonAuthenticationService, AuthenticationService, TitleService } from 'app/services';
import { Select2OptionData } from 'ng2-select2';

import { ModalTenantAddMembersComponent } from '../../components/modal-tenant-add-members/modal-tenant-add-members.component';
import { ModalTenantRemoveMembersComponent } from '../../components/modal-tenant-remove-members/modal-tenant-remove-members.component';
import { ModalTenantAddNewMemberComponent } from '../../../shared/components/modal-tenant-add-new-member/modal-tenant-add-new-member.component';

import { BBBSettingModalComponent } from '@shared/components/bbb-setting-modal/bbb-setting-modal.component';


import * as _ from 'lodash';
@Component({
  selector: 'app-tenant-user-list',
  templateUrl: './tenant-user-list.component.html',
  styleUrls: ['./tenant-user-list.component.scss']
})
export class TenantUserListComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;

  userListFromAPI = [];
  userListForDisplay = [];
  currentSelectedTenantId = 0;
  tenantDetails: any = {};

  currentSearchQuery = '';

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  sortConfig = {
    column: 'name',
    mode: 'asc',
  };

  maxSize = 5;

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();
  currentLoginUser;
  isAllowAdminAddRoles = true;
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
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private notify: NotificationService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private nonAuthService: NonAuthenticationService,
    private authService: AuthenticationService,
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.isProcessing = true;
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      if (!resp.data.admin_area) {
        this.router.navigate(['/error', '404']);
      } else if (!resp.data.multi_tenancy) {
        this.router.navigate(['/error', '404']);
      } else {
        this.activatedRoute.params.subscribe(params => {
          this.currentSelectedTenantId = params.instId;
          this.authService.userInfo().subscribe(info => {
            this.currentLoginUser = info.data;
            this.getTenantDetails();
          });
        });
      }
    });

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
        this.getTenantDetails();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  getTenantDetails() {
    this.adminService.getTenantDetails(this.currentSelectedTenantId).subscribe(resp => {
      this.tenantDetails = resp.data;
      this.userListFromAPI = this.tenantDetails.users;
      this.handlePagination();
      this.isProcessing = false;
      this.titleService.setTitle([
        {
          str: this.tenantDetails.name,
          translate: false
        },
        {
          str: "ADMIN.INSTITUTIONS.TITLE.INSTITUTION_USER_LIST",
          translate: true
        }
      ])
    });
  }


  triggerSort(columnName) {
    if (columnName !== this.sortConfig.column) {
      this.sortConfig.mode = 'asc';
    } else {
      if (this.sortConfig.mode === 'asc') {
        this.sortConfig.mode = 'desc';
      } else {
        this.sortConfig.mode = 'asc';
      }
    }
    this.sortConfig.column = columnName;
    this.handleSort();
  }

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'email':
          this.userListFromAPI = _.orderBy(this.userListFromAPI, ele => ele.email.toLowerCase(), order);
          break;
        case 'is_active':
          this.userListFromAPI = _.orderBy(this.userListFromAPI, ['is_active'], order);
          break;
        case 'usage':
          this.userListFromAPI = _.orderBy(this.userListFromAPI, ['usage'], order);
          break;
        case 'last_login':
          this.userListFromAPI = _.orderBy(this.userListFromAPI, ['last_login'], order);
          break;
      }
      this.handlePagination();
    }
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.userListForDisplay = Object.assign([], this.userListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.userListFromAPI = this.userListFromAPI.filter(ele => ele.email.toLowerCase().includes(this.currentSearchQuery));
      }
      this.userListForDisplay = this.userListFromAPI.slice(start, end);
    }
  }

  onSearchFilterChange(data) {
    const currentTimeStamp = new Date();
    if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
      clearTimeout(this.searchTimeOut);
    }
    this.searchChangeTimeStamp = currentTimeStamp;
    this.searchTimeOut = setTimeout(() => {
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.getTenantDetails();
    }, this.searchDelayInMilliseconds);
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.userListFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  pageChanged(data) {
    this.pagination = data;
    this.handlePagination();
  }

  openRemoveTenantMembersModal(user) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalTenantRemoveMembersComponent, {
      class: 'modal-md',
      initialState: {
        selectedUser: user,
        selectedTenantDetails: this.tenantDetails,
      }
    });
  }

  openAddUserToTenantModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalTenantAddMembersComponent, {
      class: 'modal-md',
      initialState: {
        selectedTenant: this.tenantDetails
      }
    });
  }

  openModalAddNewUser() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalTenantAddNewMemberComponent, {
      class: 'modal-md',
      initialState: {
        selectedTenant: this.tenantDetails,
        isAllowAdminAddRoles: this.isAllowAdminAddRoles,
      }
    });
  }

  toggleAdminStatus(user) {
    this.adminService.postToggleTenantAdminStatus(this.tenantDetails.id, user.email).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.getTenantDetails();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    });
  }

  setEditMode(user, editType) {
    user.isEdit = true;
    user.editMode = 'status';
  }

  changeUserStatus(user, status) {
    const statusForRequest = status.value === 'true' ? '1' : '0';
    this.adminService.postChangeUserStatus(user.email, statusForRequest).subscribe(resp => {
      user.is_active = status.value === 'true' ? true : false;
      user.isEdit = false;
      user.editMode = '';
      if (status.value === 'true') {
        this.notify.showNotification('success', this.translate.instant('ROLES.ACTIVATE_USER_SUCCESS'));
      } else {
        this.notify.showNotification('success', this.translate.instant('ROLES.DEACTIVATE_USER_SUCCESS'));
      }
    }, err => {
      const errorObj = JSON.parse(err._body);
      console.log(errorObj);
      this.notify.showNotification('danger', errorObj.message);
    });
  }

  openTenantBBBSettingModal() {
    this.prepareModalSubscription();
    const initialState = {
      tenantInfo: this.tenantDetails,
      isAdminMode: true,
      settingMode: 'tenant'
    };
    this.bsModalRef = this.modalService.show(BBBSettingModalComponent, { class: 'modal-md', initialState });
  }
}
