
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as _ from 'lodash';

import { AdminService, NotificationService, NonAuthenticationService } from 'app/services';

import { ModalPublicShareLinkRemoveComponent } from '../../components/modal-public-share-link-remove/modal-public-share-link-remove.component';
import { ModalInternalShareRemoveComponent } from '../../components/modal-internal-share-remove/modal-internal-share-remove.component';
import { ModalConfirmationComponent } from '@shared/components/modal-confirmation/modal-confirmation.component';

import { sortByColumn, onChangeTable } from 'app/app.helpers';

@Component({
  selector: 'app-public-share-links',
  templateUrl: './public-share-links.component.html',
  styleUrls: ['./public-share-links.component.scss']
})
export class PublicShareLinksComponent implements OnInit {

  @ViewChild(ModalConfirmationComponent) modalConfirmationComponent;

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;

  shareListFromAPI = [];
  shareListForDisplay = [];

  currentSearchQuery = '';

  pagination = {
    page: 1,
    itemsPerPage: 30,
    totalResult: 0,
  };

  sortConfig = {
    column: 'repo_name',
    mode: 'desc',
  };

  maxSize = 5;
  length = 0;
  numPages = 1;

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  isEnabledAdminArea = false;

  columns = [
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.NAME', name: 'repo_name', sort: true, width: '20%' },
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.UPDATED', name: 'ctime', sort: true, width: '10%', class: 'd-none d-lg-table-cell' },
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.SIZE', name: 'size', sort: true, width: '10%', class: 'd-none d-lg-table-cell' },
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.SHARE_OWNER', name: 'username', sort: true, width: '10%', class: 'd-none d-lg-table-cell' },
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.SHARE_TO', name: 'share_type', sort: true, width: '10%', class: 'd-none d-lg-table-cell' },
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.PERMISSION', name: 'permission', sort: false, width: '10%', class: 'd-none d-lg-table-cell' },
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.VISIT_COUNT', name: 'view_cnt', sort: true, width: '10%', class: 'd-none d-lg-table-cell' },
    { title: 'ADMIN.PUBLIC_SHARES.LIST_PUBLIC_SHARE_LINKS.TABLE_HEADERS.EXPIRED', name: 'expire_date', sort: true, width: '10%', class: 'd-none d-lg-table-cell' },
  ];

  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };


  constructor(
    private router: Router,
    private adminService: AdminService,
    private notify: NotificationService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private nonAuthService: NonAuthenticationService,

  ) { }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminArea = resp.data.admin_area;
      if (!this.isEnabledAdminArea) {
        this.router.navigate(['/error', '404']);
      }
    });
    this.isProcessing = true;
    this.getAllShare();
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
        case 'repo_name':
          this.shareListFromAPI = _.orderBy(this.shareListFromAPI, ele => ele.repo_name.toLowerCase(), order);
          break;
        case 'size':
          this.shareListFromAPI = _.orderBy(this.shareListFromAPI, ['size'], order);
          break;
        case 'ctime':
          this.shareListFromAPI = _.orderBy(this.shareListFromAPI, ele => ele.ctime.toLowerCase(), order);
          break;
        case 'username':
          this.shareListFromAPI = _.orderBy(this.shareListFromAPI, ele => ele.username, order);
          break;
        case 'share_type':
          this.shareListFromAPI = _.orderBy(this.shareListFromAPI, ele => ele.share_type.toLowerCase(), order);
          break;
        case 'view_cnt':
          this.shareListFromAPI = _.orderBy(this.shareListFromAPI, ele => ele.view_cnt, order);
          break;
        case 'expire_date':
          this.shareListFromAPI = _.orderBy(this.shareListFromAPI, ['expire_date'], order);
          break;
      }
      this.handlePagination();
    }
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.shareListFromAPI, this.columns, config, this.pagination);
    this.shareListForDisplay = data.rows;

    this.length = data.length;
  }

  triggerSort(columnName) {
    if (columnName !== this.sortConfig.column) {
      this.sortConfig.mode = 'asc';
    } else {
      if (this.sortConfig.mode === 'desc') {
        this.sortConfig.mode = 'asc';
      } else if (this.sortConfig.mode === 'asc') {
        this.sortConfig.mode = 'desc';
      }
    }
    this.sortConfig.column = columnName;
    this.handleSort();
  }

  getAllShare() {
    this.adminService.getAllShare().subscribe(resp => {
      this.shareListFromAPI = resp.data.shares;
      this.length = this.shareListFromAPI.length;
      this.handlePagination();
      this.isProcessing = false;
    });
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.shareListForDisplay = Object.assign([], this.shareListFromAPI);
      this.pagination.totalResult = this.shareListFromAPI.length;

      this.length = this.shareListFromAPI.length;
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.shareListFromAPI = this.shareListFromAPI.filter(ele => {
          return (ele.folder_name && `/${ele.folder_name}${ele.path}`.toLowerCase().includes(this.currentSearchQuery)) ||
            (ele.obj_name && `/${ele.obj_name}${ele.path}`.toLowerCase().includes(this.currentSearchQuery)) ||
            (ele.owner && ele.owner.toLowerCase().includes(this.currentSearchQuery)) ||
            (ele.user_name && ele.user_name.toLowerCase().includes(this.currentSearchQuery)) ||
            (ele.user_email && ele.user_email.toLowerCase().includes(this.currentSearchQuery)) ||
            (ele.meeting_name && ele.meeting_name.toLowerCase().includes(this.currentSearchQuery)) ||
            (ele.room_owner && ele.room_owner.toLowerCase().includes(this.currentSearchQuery)) ||
            (ele.share_to && ele.share_to.toLowerCase().includes(this.currentSearchQuery));
        });
      }
      this.shareListForDisplay = this.shareListFromAPI.slice(start, end);
    }
  }

  // handlePagination() {
  //   if (this.pagination.itemsPerPage <= 0) {
  //     this.linkListForDisplay = Object.assign([], this.linkListFromAPI);
  //   } else {
  //     const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
  //     const end = start + this.pagination.itemsPerPage;

  //     if (this.currentSearchQuery !== '') {
  //       this.linkListFromAPI = this.linkListFromAPI.filter(ele => {
  //         return ele.token.toLowerCase().includes(this.currentSearchQuery) ||
  //           ele.obj_name.toLowerCase().includes(this.currentSearchQuery) ||
  //           ele.repo_name.toLowerCase().includes(this.currentSearchQuery) ||
  //           ele.path.toLowerCase().includes(this.currentSearchQuery) ||
  //           ele.username.toLowerCase().includes(this.currentSearchQuery);
  //       });
  //     }
  //     this.linkListForDisplay = this.linkListFromAPI.slice(start, end);
  //   }
  // }

  onSearchFilterChange(config, page = this.pagination) {
    // const currentTimeStamp = new Date();
    // if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
    //   clearTimeout(this.searchTimeOut);
    // }
    // this.searchChangeTimeStamp = currentTimeStamp;
    // this.searchTimeOut = setTimeout(() => {
    //   this.currentSearchQuery = data.target.value;
    //   this.pagination.page = 1;
    //   this.getAllShare();
    // }, this.searchDelayInMilliseconds);
    const data = onChangeTable(config, this.shareListFromAPI, this.columns, page);
    this.shareListForDisplay = data.rows;
    this.length = data.length;
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.shareListFromAPI.length;
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

  prepareModalSubscription() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.getAllShare();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  openRemoveLinkModal(link) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalPublicShareLinkRemoveComponent, {
      class: 'modal-md',
      initialState: {
        selectedLink: link,
      }
    });
  }

  openInternalShareRemoveModal(share) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalInternalShareRemoveComponent, {
      class: 'modal-md',
      initialState: {
        selectedShare: share,
      }
    });
  }


  setErrorImg(share) {
    share.imgError = 1;
  }

  visitLink(link) {
    window.open(`${window.location.origin}/share-link/${link.link}`, '_blank');
    // console.log(`${window.location.origin}/share-link/${link.link}`);
  }

}
