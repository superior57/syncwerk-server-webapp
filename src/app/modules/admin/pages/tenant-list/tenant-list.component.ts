
import {combineLatest as observableCombineLatest,  Observable ,  Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AdminService, NotificationService, NonAuthenticationService } from 'app/services';

import { ModalCreateTenantComponent } from '../../components/modal-create-tenant/modal-create-tenant.component';
import { ModalRemoveTenantComponent } from '../../components/modal-remove-tenant/modal-remove-tenant.component';
import { ModalTenantUpdateQuotaComponent } from '../../components/modal-tenant-update-quota/modal-tenant-update-quota.component';

import * as _ from 'lodash';

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrls: ['./tenant-list.component.scss']
})
export class TenantListComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;

  tenantListFromAPI = [];
  tenantListForDisplay = [];

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

  isEnabledAdminArea = false;

  constructor(
    private router: Router,
    private adminService: AdminService,
    private notify: NotificationService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private nonAuthService: NonAuthenticationService

  ) { }

  ngOnInit() {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminArea = resp.data.admin_area;
      if (!this.isEnabledAdminArea) {
        this.router.navigate(['/error', '404']);
      }
      if (!resp.data.multi_tenancy) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.isProcessing = true;
    this.getListTenant();
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
        this.getListTenant();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  getListTenant() {
    this.adminService.getListTenant().subscribe(resp => {
      this.tenantListFromAPI = resp.data.insts;
      this.handlePagination();
      this.isProcessing = false;
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
        case 'name':
          this.tenantListFromAPI = _.orderBy(this.tenantListFromAPI, ele => ele.name.toLowerCase(), order);
          break;
        case 'space_usage':
          this.tenantListFromAPI = _.orderBy(this.tenantListFromAPI, ['space_usage'], order);
          break;
        case 'ctime':
          this.tenantListFromAPI = _.orderBy(this.tenantListFromAPI, ['ctime'], order);
          break;
      }
      this.handlePagination();
    }
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.tenantListForDisplay = Object.assign([], this.tenantListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.tenantListFromAPI = this.tenantListFromAPI.filter(ele => ele.name.toLowerCase().includes(this.currentSearchQuery));
      }
      this.tenantListForDisplay = this.tenantListFromAPI.slice(start, end);
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
      this.getListTenant();
    }, this.searchDelayInMilliseconds);
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.tenantListFromAPI.length;
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

  openCreateTenantModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateTenantComponent, {
      class: 'modal-md'
    });
  }

  openRemoveTenantModal(inst) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalRemoveTenantComponent, {
      class: 'modal-md',
      initialState: {
        selectedTenant: inst,
      }
    });
  }

  openChangeQuotaModal(inst) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalTenantUpdateQuotaComponent, {
      class: 'modal-sm',
      initialState: {
        selectedTenant: inst,
      }
    });
  }

}
