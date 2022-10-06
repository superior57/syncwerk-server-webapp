import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';

import { AppConfig } from 'app/app.config';
import { FilesService, MessageService } from '@services/index';
import { Type } from '@enum/index.enum';

declare var jQuery: any;

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss']
})
export class DetailsModalComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  @Input() Data;
  @Input() IsFolder = true;
  file_count;
  folder_count;
  location;
  size;
  repoId;
  path;
  errorImg = 0;

  constructor(
    private filesService: FilesService, private messageService: MessageService) {
    this.subscribe();
  }

  ngOnInit() {
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Details_Modal, (payload) => {
      this.initData();
      this.getDetails(payload);
    });
  }
  initData() {
    this.file_count = null;
    this.folder_count = null;
    this.location = null;
    this.size = null;
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

  getDetails(data) {
    this.repoId = data.folderId;
    this.path = data.path;
    this.filesService.getDetails(data.folderId, data.repoType, data.path)
      .subscribe(resp => {
        this.handleResponseData(resp.data);
      }, error => {
      });
  }

  handleResponseData(data) {
    this.file_count = data.file_count;
    this.folder_count = data.dir_count;
    this.location = data.repo_name + data.path ? data.path : data.parent_dir;
    this.size = data.size;
  }

  closeModal() {
    jQuery('#details-modal').modal('hide');
  }

  getFileType(fileName) {
    const fileType = fileName.split('.', 2)[1];
    return fileType;
  }

  setErrorImg() {
    this.errorImg = 1;
  }
}
