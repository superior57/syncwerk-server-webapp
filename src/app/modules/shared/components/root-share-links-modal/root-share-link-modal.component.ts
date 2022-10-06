import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { FoldersModel } from 'app/Models/Folder.model';
import { Type } from '@enum/index.enum';
import { NotificationService, MessageService, ShareLinkService } from '@services/index';

declare var jQuery: any;

@Component({
  selector: 'app-root-share-link-modal',
  templateUrl: './root-share-link-modal.component.html',
  styleUrls: ['./root-share-link-modal.component.scss']
})
export class RootShareLinkModalComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  @Input() Folder: FoldersModel;
  downloadLinks;
  uploadLinks;
  currentList;
  currentTab = 0;
  repoId = '';

  constructor(
    private shareLinkService: ShareLinkService,
    private messageService: MessageService,
    private router: Router,
    private noti: NotificationService,
  ) {
    this.subscribe();
  }

  ngOnInit() {
  }

  subscribe() {
    this.subscription = this.messageService
      .subscribe(Type.Share_Links_Modal, (payload) => {
        this.currentTab = 0;
        this.repoId = payload.folderId;
        this.getShareLink(payload.folderId);
      });
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  getShareLink(folderId: string) {
    this.shareLinkService.getShareDownloadLinks(folderId)
      .subscribe(resp => {
        this.downloadLinks = resp.data;
        this.currentList = this.downloadLinks; // default showing download list
      }, error => {
        console.error(error);
      });
    this.shareLinkService.getShareUploadLinks(folderId)
      .subscribe(resp => {
        this.uploadLinks = resp.data;
      }, error => {
        console.error(error);
      });
  }

  closeModal() {
    jQuery('#share-link-modal').modal('hide');
  }

  changeTab(index: number) {
    if (this.currentTab === index) { return; }
    this.currentTab = index;
    this.currentList = (this.currentTab === 1 ? this.uploadLinks : this.downloadLinks);
  }

  viewUserProfile(userEmail: string) {
    jQuery('#share-link-modal').modal('hide');
    this.router.navigate(['user', 'profile', userEmail]);
  }

  openObject(type, path) {
    jQuery('#share-link-modal').modal('hide');
    const p = path.split('/').filter(data => data.length > 0);
    const pa = p.join('/');
    if (type === 'f') {
      this.router.navigate(['preview', this.repoId], {
        queryParams: {
          p: pa,
          ref: `/folders`,
        }
      });
    } else {
      if (pa !== '') {
        this.router.navigate(['folders', this.repoId, pa]);
      } else {
        this.router.navigate(['folders', this.repoId]);
      }
    }
  }

  copyClipboard(link: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = link;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }

  removeLinks(l, index) {
    console.log(index);
    if (this.currentTab === 0 && l.share_type) {
      this.shareLinkService.removeDownloadLink(this.repoId, l.token)
        .subscribe(resp => {
          this.currentList.splice(index, 1);
          this.noti.showNotification('success', resp.message);
        }, error => {
          this.noti.showNotification('error', 'Fail remove download link');
          console.log(error);
        });
    } else if (this.currentTab === 1 && !l.share_type) {
      this.shareLinkService.removeUploadLink(this.repoId, l.token)
        .subscribe(resp => {
          this.currentList.splice(index, 1);
          this.noti.showNotification('success', resp.message);
        }, error => {
          this.noti.showNotification('error', 'Fail remove upload link');
          console.log(error);
        });
    }
  }

  setErrorImg(index) {
    this.currentList[index].imgError = 1;
  }
}
