import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { Action, Type } from '@enum/index.enum';
import { NotificationService, FilesService, MessageService } from '@services/index';

@Component({
  selector: 'app-share-upload-link',
  templateUrl: './share-upload-link.component.html',
  styleUrls: ['./share-upload-link.component.scss']
})
export class ShareUploadLinkComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  @Input() id = '';
  @Input() Path = '/';
  @Output() rmLink = new EventEmitter();

  data;
  isData = false;
  isLoading = false;
  isSendMail = false;

  constructor(
    private filesService: FilesService,
    private messageService: MessageService,
    private router: Router,
    private noti: NotificationService,
  ) { this.subscribe(); }

  ngOnInit() { }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Upload_Link, (payload) => {
      this.isLoading = true;
      this.isData = payload.data ? true : false;
      this.data = payload.data;

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

  generateUploadLink(data) {
    data['repo_id'] = this.id;
    data['path'] = this.Path;
    this.filesService.createUploadLink(data).subscribe(
      res => {
        this.isLoading = true;
        this.isData = true;
        this.data = res.data;
        this.data.link = `${window.location.origin}/${this.data.link}`;
        this.messageService.send(Type.Share_Folder_Modal, Action.Generate_Upload_Link, this.data);
      }, error => console.error(error));
  }

  removeLink() {
    this.rmLink.emit();
  }

  deleteLink() {
    this.filesService.deleteUploadLink(this.data.token)
      .subscribe(res => {
        this.isData = false;
        this.messageService.send(Type.Share_Folder_Modal, Action.Remove_Upload_Link, '');
        this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DELETE_SHARED_UPLOAD_LINK_SUCCESSFULLY');
      }, error => console.error(error));
  }

  openFormSend() {
    this.isSendMail = true;
  }

  cancelSendEmail() {
    this.isSendMail = false;
  }

  getLink() {
    const link = this.data.link;
    let splitUrl, newUrl;
    splitUrl = link.split('/');
    splitUrl.splice(3, 0, 'share-link');
    newUrl = splitUrl.join('/');
    return newUrl;
  }

  submitCopy() {
    this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }
}
