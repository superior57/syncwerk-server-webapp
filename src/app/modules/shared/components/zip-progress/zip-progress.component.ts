import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MessageService, FilesService } from '@services/index';
import { Type } from '@enum/index.enum';
import { FileSystemEntry, FileSystemFileEntry } from 'ngx-file-drop';

declare var jQuery: any;

@Component({
  selector: 'app-zip-progress',
  templateUrl: './zip-progress.component.html',
  styleUrls: ['./zip-progress.component.scss']
})
export class ZipProgressComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  zipToken = '';
  zipUrl = '';

  zipProgressTracking: any;

  currentZipFile = 0;
  totalZipFile = 0;

  constructor(
    private messageService: MessageService,
    private fileService: FilesService,
  ) { }

  ngOnInit() {
    this.subscribe();
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

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Zip_Progress_Modal, (payload) => {
      switch (payload.action.toLowerCase()) {
        case 'zip-start':
          this.showModal();
          this.zipToken = payload.data.zip_token;
          this.zipUrl = payload.data.url;
          this.beginZipProgress();
          break;
        default:
          break;
      }
    });
  }

  showModal() {
    jQuery('#zip-progress-modal').modal({ backdrop: 'static', keyboard: false });
  }

  hideModal() {
    jQuery('#zip-progress-modal').modal('hide');
  }

  beginZipProgress() {
    this.zipProgressTracking = setInterval(() => {
      this.fileService.getZipProgress(this.zipToken).subscribe(resp => {
        const zipProgressObject = JSON.parse(resp.data);
        this.currentZipFile = zipProgressObject.zipped;
        this.totalZipFile = zipProgressObject.total;
        if (this.currentZipFile >= this.totalZipFile) {
          this.zipFinished();
        }
      });
    }, 1000);
  }

  zipFinished() {
    clearInterval(this.zipProgressTracking);
    this.hideModal();
    window.location.href = this.zipUrl;
  }
}
