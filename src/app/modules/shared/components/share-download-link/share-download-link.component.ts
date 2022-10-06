import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Action, Type } from '@enum/index.enum';
import { NotificationService, MessageService, FilesService } from '@services/index';

@Component({
  selector: 'app-share-download-link',
  templateUrl: './share-download-link.component.html',
  styleUrls: ['./share-download-link.component.scss']
})
export class ShareDownloadLinkComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  isPasswordProtection = false;
  isExpiration = false;
  isLoading = false;
  isData = false;
  data;
  isSendMail = false;
  params: any;
  @Output() rmLink = new EventEmitter();

  @Input() id = '';
  @Input() Path = '/';
  constructor(
    private filesService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
  ) {

  }

  ngOnInit() {
    this.subscribe();
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Download_Link, (payload) => {
      this.isLoading = true;
      if (payload.type === Type.Download_Link) {
        this.isData = payload.data ? true : false;
        this.data = payload.data;
      }
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

  generateDownloadLink(data) {
    data['repo_id'] = this.id;
    data['path'] = this.Path;
    this.filesService.createShareLink(data)
      .subscribe(resp => {
        this.isLoading = true;
        this.isData = true;
        this.data = resp.data;
        this.data.link = `${window.location.origin}/${this.data.link}`;
        this.messageService.send(Type.Share_Folder_Modal, Action.Generate_Download_Link, this.data);
      }, error => console.error(error));
  }

  getLink() {
    // const link = this.data.is_dir
    //   ? this.filesService.getURLByPath(`share-link/d/${this.data.token}`)
    //   : this.filesService.getURLByPath(`share-link/f/${this.data.token}`);
    const link = this.data.link;
    let splitUrl, newUrl;
    splitUrl = link.split('/');
    splitUrl.splice(3, 0, 'share-link');
    newUrl = splitUrl.join('/');
    return newUrl;
  }

  removeLink() {
    this.rmLink.emit();
  }

  deleteLink() {
    this.filesService.deleteLinkFileShare(this.data.token)
      .subscribe(resp => {
        this.isData = false;
        this.messageService.send(Type.Share_Folder_Modal, Action.Remove_Share_Link, '');
        this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DELETE_SHARED_DOWNLOAD_LINK_SUCCESSFULLY');
      }, error => {
        console.log(error);
      });
  }

  openFormSend() {
    this.isSendMail = true;
  }

  cancelSendEmail() {
    this.isSendMail = false;
  }

  submitCopy() {

    this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }
}
