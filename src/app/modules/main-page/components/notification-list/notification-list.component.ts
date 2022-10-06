import { Component, OnInit, ViewChild } from '@angular/core';
import { OtherService, NotificationService } from '@services/index';
import { isEmpty } from 'app/app.helpers';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';

declare const jQuery: any;

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})

export class NotificationListComponent implements OnInit {
  private offset = 0;
  private total;

  @ViewChild(ModalDeleteRemoveComponent) private modalDeleteRemoveComponent;

  notificationList;
  processing = true;
  isOpenModal = {
    clear_all: false,
  };
  isDefaultAvater = false;
  getListNotificationsPerSecond;
  numberItemsCurrent = 0;

  constructor(
    private otherService: OtherService,
    private location: Location,
    private notification: NotificationService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getNotifications();
    this.getListNotificationsPerSecond = setInterval(() => {
      this.getNotifications();
    }, 1000 * 60);
  }

  getNotifications() {
    this.processing = true;
    if (this.numberItemsCurrent === 0) {
      this.numberItemsCurrent = 25;
    }
    this.otherService.getNotificationList(0, this.numberItemsCurrent).subscribe(resp => {
      if (resp.data.notifications !== this.notificationList) {
        this.notificationList = resp.data.notifications;
      }
      // this.notificationList = resp.data.notifications;
      // this.isDefaultAvater = resp.data.notifications.msg_from;
      this.total = resp.data.total;
      this.notificationList.forEach((notificationItem) => {
        if (notificationItem.msg_type === 'file_uploaded') {
          const routerLink = notificationItem.detail.uploaded_to.split('/');
          routerLink.splice(0, 1);
          notificationItem.detail.routerLink = ['/folders', notificationItem.detail.repo_id, ...routerLink];
        }
      });
      this.processing = false;
    }, error => this.notification.showNotification('danger', JSON.parse(error._body).message));
  }

  notificationAvatar(notif) {
    if ((typeof (notif.msg_from) !== 'undefined') && (typeof (notif.msg_from.avatar_url) !== 'undefined')) {
      return notif.msg_from.avatar_url;
    }
    return notif.default_avatar_url;
  }

  markAllSeen() {
    this.otherService.markAllSeenNotification().subscribe(resp => {
      this.getNotifications();
      this.notification.showNotification('success', resp.message);
      // TODO: subcribe header to update the notif count
    }, error => console.error(error));
  }

  loadMore() {
    this.offset = this.notificationList.length;
    this.numberItemsCurrent = this.offset + 25;
    // clearInterval(this.getListNotificationsPerSecond);
    // flag offset, 25
    this.otherService.getNotificationList(this.offset, 25).subscribe(resp => {
      if (isEmpty(resp.data.notifications)) {
      } else {
        this.notificationList = this.notificationList.concat(resp.data.notifications);
      }
    }, error => {
      this.notification.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  goBack() {
    this.location.back();
  }

  openFilePreview(repo_id, file_path) {
    this.router.navigate(['preview', repo_id], {
      queryParams: {
        p: file_path,
        ref: this.router.url
      }
    });
  }

  markRead(seen, id) {
    if (!seen) {
      this.otherService.markSeenNotification(id).subscribe(resp => {
        this.getNotifications();
        // TODO: subcribe header to update the notif count
      }, error => console.error(error));
    }
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  handleOpenModal(modalName: string) {
    if (modalName === 'clear-all') {
      this.isOpenModal.clear_all = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.clear_all = false);
    }
  }

  onClearAll() {
    this.otherService.clearNotification().subscribe(resps => {
      this.getNotifications();
      jQuery('#modal-delete-remove').modal('hide');
      this.notification.showNotification('success', resps.message);
    }, error => {
      this.modalDeleteRemoveComponent.isProcessing = false;
      this.notification.showNotification('danger', JSON.parse(error._body).message);
    });
  }
}
