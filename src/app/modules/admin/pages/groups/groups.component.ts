
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AdminService, NotificationService, AuthenticationService, NonAuthenticationService } from 'app/services';

import { ModalAddNewGroupComponent } from '../../components/modal-add-new-group/modal-add-new-group.component';

import { ModalGroupRenameComponent } from '../../components/modal-group-rename/modal-group-rename.component';

import * as _ from 'lodash';

declare var jQuery: any;

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  bsModalRef: BsModalRef;

  isProcessing = false;
  pagination = {
    page: 1,
    itemsPerPage: 30,
    totalResult: 0,
  };

  maxSize = 5;

  sortConfig = {
    column: 'name',
    mode: 'asc',
  };

  subscriptions: Subscription[] = [];

  groupList = [];
  groupListFromAPI = [];

  isModalOpen = {
    transferGroup: false,
    removeGroup: false,
  };

  currentGroupInfo: any = {};
  currentSearchQuery = '';

  currentUserPermission: any = {
    can_manage_group: false,
  };

  isGetGroupEnabled = false;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private notify: NotificationService,
    private authService: AuthenticationService,
    private nonAuthService: NonAuthenticationService,
    private translate: TranslateService
  ) {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isGetGroupEnabled = resp.data.groups;
      if (!this.isGetGroupEnabled) {
        this.router.navigate(['/error', '404']);
      }
    });
   }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;
      this.getListGroups();
    });

    this.isProcessing = true;
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'name':
          this.groupListFromAPI = _.orderBy(this.groupListFromAPI, ele => ele.name.toLowerCase(), order);
          break;
        case 'owner':
          this.groupListFromAPI = _.orderBy(this.groupListFromAPI, ele => ele.owner.name.toLowerCase(), order);
          break;
        case 'members_count':
          this.groupListFromAPI = _.orderBy(this.groupListFromAPI, ['members_count'], order);
          break;
        case 'repos_count':
          this.groupListFromAPI = _.orderBy(this.groupListFromAPI, ['repos_count'], order);
          break;
        case 'created_at':
          this.groupListFromAPI = _.orderBy(this.groupListFromAPI, ['created_at'], order);
          break;
      }
      this.handlePagination();
    }
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.groupList = Object.assign([], this.groupListFromAPI);
      this.pagination.totalResult = this.groupListFromAPI.length;
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        const result = this.groupListFromAPI.filter(ele => ele.name.toLowerCase().includes(this.currentSearchQuery));
        this.groupList = result.slice(start, end);
        this.pagination.totalResult = result.length;
      } else {
        this.groupList = this.groupListFromAPI.slice(start, end);
        this.pagination.totalResult = this.groupListFromAPI.length;
      }
    }
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

  getListGroups() {
    this.isProcessing = true;
    this.adminService.getGroupList().subscribe(resp => {
      console.log({ resp });
      this.groupListFromAPI = resp.data.groups;
      this.handleSort();
      this.handlePagination();
      this.isProcessing = false;
    });
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.groupListFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  openCreateGroupModal() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.getListGroups();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.bsModalRef = this.modalService.show(ModalAddNewGroupComponent, {
      class: 'modal-md'
    });
  }

  openModalRenameGroup(group) {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.getListGroups();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.bsModalRef = this.modalService.show(ModalGroupRenameComponent, {
      class: 'modal-md',
      initialState: {
        selectedGroup: group,
      },
    });
  }

  onSearchFilterChange(data) {
    console.log(data);
    // "Enter" key has key code of 13
    if (data.keyCode === 13) {
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.getListGroups();
    }
  }

  openModalTransferGroup(group) {
    this.currentGroupInfo = group;
    this.handleOpenModal('transferGroup');
  }

  openModalRemoveGroup(group) {
    this.currentGroupInfo = group;
    this.handleOpenModal('removeGroup');
  }

  handleOpenModal(typeModal: string) {
    switch (typeModal) {
      case 'transferGroup':
        this.isModalOpen.transferGroup = true;
        this.openModal('#admin-group-transfer', () => this.isModalOpen.transferGroup = false);
        break;
      case 'removeGroup':
        this.isModalOpen.removeGroup = true;
        this.openModal('#admin-remove-group', () => this.isModalOpen.removeGroup = false);
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

  transferGroupSuccess() {
    jQuery('#admin-group-transfer')
      .modal('hide');
    this.getListGroups();
  }

  onRemoveGroupSuccess() {
    jQuery('#admin-remove-group')
      .modal('hide');
    this.getListGroups();
  }

  pageChanged(data) {
    this.pagination.page = data.page;
    this.pagination.itemsPerPage = data.itemsPerPage;
    this.getListGroups();
  }

  exportGroups() {
    this.adminService.getExportAllGroups().subscribe(resp => {
      window.location.href = resp.url;
    }, error => {
      this.notify.showNotification('danger', JSON.parse(error._body).message);
    });
  }

}
