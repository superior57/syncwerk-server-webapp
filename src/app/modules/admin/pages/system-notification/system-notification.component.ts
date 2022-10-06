
import {combineLatest as observableCombineLatest,  Observable ,  Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AdminService, NotificationService, MessageService, NonAuthenticationService } from 'app/services';
import { Action, Type } from '@enum/index.enum';

import { ModalCreateSystemNotificationComponent } from '../../components/modal-create-system-notification/modal-create-system-notification.component';
import { ModalEditSystemNotificationComponent } from '../../components/modal-edit-system-notification/modal-edit-system-notification.component';
import { ModalRemoveSystemNotificationComponent } from '../../components/modal-remove-system-notification/modal-remove-system-notification.component';

@Component({
  selector: 'app-system-notification',
  templateUrl: './system-notification.component.html',
  styleUrls: ['./system-notification.component.scss']
})
export class SystemNotificationComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;

  notificationListFromAPI = [];
  notificationListForDisplay = [];

  currentSearchQuery = '';

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  maxSize = 5;

  isEnabledAdminArea = false;

  constructor(
    private translate: TranslateService,
    private adminService: AdminService,
    private notify: NotificationService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private message: MessageService,
    private nonAuthService: NonAuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminArea = resp.data.admin_area;
      if (!this.isEnabledAdminArea) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.isProcessing = true;
    this.getNotificationList();
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  getNotificationList() {
    this.adminService.getListSystemNotification().subscribe(resp => {
      console.log(resp);
      this.notificationListFromAPI = resp.data;
      this.handlePagination();
      this.isProcessing = false;
    });
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.notificationListForDisplay = Object.assign([], this.notificationListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.notificationListFromAPI = this.notificationListFromAPI.filter(ele => ele.notificationMessage.toLowerCase().includes(this.currentSearchQuery));
      }
      this.notificationListForDisplay = this.notificationListFromAPI.slice(start, end);
    }
  }

  onSearchFilterChange(data) {
    this.currentSearchQuery = data.target.value;
    this.pagination.page = 1;
    if (this.currentSearchQuery !== '') {
      this.handlePagination();
    } else {
      // this.isProcessing = true;
      this.getNotificationList();
    }
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.notificationListFromAPI.length;
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

  setDefaultNotification(notification) {
    this.adminService.putUpdateSystemNotification(notification.id, 1, notification.notificationMessage).subscribe(resp => {
      this.getNotificationList();
      this.notify.showNotification('success', this.translate.instant('ADMIN.NOTIFICATIONS.MESSAGES.SET_AS_DEFAULT_SUCCESS'));
      this.message.send(Type.Main_Page, Action.SystemNotificationUpdate, {});
    });
  }

  removeDefaultNotification(notification) {
    this.adminService.putUpdateSystemNotification(notification.id, 0, notification.notificationMessage).subscribe(resp => {
      this.getNotificationList();
      this.notify.showNotification('success', this.translate.instant('ADMIN.NOTIFICATIONS.MESSAGES.DEACTIVE_DEFAULT_SUCCESS'));
      this.message.send(Type.Main_Page, Action.SystemNotificationUpdate, {});
    });
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
        this.getNotificationList();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  openCreateSystemNotificationModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateSystemNotificationComponent, {
      class: 'modal-md',
    });
  }

  openEditSystemNotificationModal(notification) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalEditSystemNotificationComponent, {
      class: 'modal-md',
      initialState: {
        selectedNotification: Object.assign({}, notification),
      }
    });
  }

  openRemoveSystemNotificationModal(notification) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalRemoveSystemNotificationComponent, {
      class: 'modal-md',
      initialState: {
        selectedNotification: notification,
      }
    });
  }

}
