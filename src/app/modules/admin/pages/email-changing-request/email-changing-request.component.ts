import {combineLatest as observableCombineLatest,  Observable ,  Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { AdminService, NotificationService } from '@services/index';

import { ModalConfirmRemoveEmailChangeRequestComponent } from '../../components/modal-confirm-remove-email-change-request/modal-confirm-remove-email-change-request.component';


@Component({
  selector: 'app-email-changing-request',
  templateUrl: './email-changing-request.component.html',
  styleUrls: ['./email-changing-request.component.scss']
})
export class EmailChangingRequestComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;
  isEmailChangeInProcess = false;

  emailChangeRequests = {
    list: [],
    totalRequest: 0,
  };

  searchQuery = '';

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  searchSetting =  {
    page: 1,
    perPage: 10,
    s: '',
    orderBy: 'created_at',
    orderType: 'desc',
  };

  maxSize = 5;

  constructor(
    private adminService: AdminService,
    private notify: NotificationService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.getUserEmailRequestList();
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
        this.getUserEmailRequestList();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  triggerSort(columnName) {
    if (columnName !== this.searchSetting.orderBy) {
      this.searchSetting.orderType = 'asc';
    } else {
      if (this.searchSetting.orderType === 'asc') {
        this.searchSetting.orderType = 'desc';
      } else {
        this.searchSetting.orderType = 'asc';
      }
    }
    this.searchSetting.orderBy = columnName;
    this.getUserEmailRequestList();
  }

  getUserEmailRequestList() {
    this.isProcessing = true;
    this.adminService.getListOfUserEmailChangeRequest(
      this.searchSetting.perPage,
      this.searchSetting.page,
      this.searchSetting.s,
      this.searchSetting.orderBy,
      this.searchSetting.orderType,
    ).subscribe(resp => {
      this.emailChangeRequests.list = resp.data.request_list;
      this.emailChangeRequests.totalRequest = resp.data.total_result;
      this.isProcessing = false;
    });
  }

  onSearchFilterChange(data) {
    const currentTimeStamp = new Date();
    if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
      clearTimeout(this.searchTimeOut);
    }
    this.searchChangeTimeStamp = currentTimeStamp;
    this.searchTimeOut = setTimeout(() => {
      this.searchSetting.s = data.target.value;
      this.searchSetting.page = 1;
      this.getUserEmailRequestList();
    }, this.searchDelayInMilliseconds);
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.searchSetting.page = 1;
      this.searchSetting.perPage = 99999999999999; // Just set this to a big number
    } else {
      this.searchSetting.page = 1;
      this.searchSetting.perPage = newItemsPerPage;
    }
    this.getUserEmailRequestList();
  }

  pageChanged(data) {
    this.searchSetting.page = data.page;
    this.getUserEmailRequestList();
  }

  triggerEmailChange(request) {
    this.isEmailChangeInProcess = true;
    request.isChanging = true;
    this.adminService.postTriggerEmailChange(request.id).subscribe(resp => {
      this.getUserEmailRequestList();
      this.isEmailChangeInProcess = false;
      request.isChanging = false;
      this.notify.showNotification('success', resp.message);
    }, error => {
      this.isEmailChangeInProcess = false;
      request.isChanging = false;
      this.notify.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  openRemoveRequestConfirmation(request) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalConfirmRemoveEmailChangeRequestComponent, {
      class: 'modal-md',
      initialState: {
        selectedRequest: request,
      }
    });
  }

}
