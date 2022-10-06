import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'lodash';
import { ResizeEvent } from 'angular-resizable-element';

import { MessageService, FilesService, AdminService, NotificationService } from '@services/index';
import { Type } from '@enum/index.enum';
import { FileSystemEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { start } from 'repl';

import { TranslateService } from '@ngx-translate/core';
import { isNumber } from 'util';
declare var jQuery: any;

@Component({
  selector: 'app-upload-process-popup',
  templateUrl: './upload-process-popup.component.html',
  styleUrls: ['./upload-process-popup.component.scss'],
})
export class UploadProcessPopupComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  isHidden = true;
  uploadFileListForShowing = [];
  humanizeBytes: Function;

  showBody = true;
  showCloseButton = false;
  uploadCheckInterval = null;
  uploadPopupHeightInPx = 200;

  constructor(
    private messageService: MessageService,
    private fileService: FilesService,
    private adminService: AdminService,
    private noti: NotificationService,
    private translate: TranslateService,

  ) {

  }

  ngOnInit() {
    this.subscribe();
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Upload_Process_Popup, (payload) => {
      switch (payload.action.toLowerCase()) {
        case 'show':
          this.isHidden = false;
          if (payload.data.type === 'click-input-upload') {
            this.processUploadSingleFileClickInput(payload.data);
          } else {
            const fileList = filter(payload.data.uploadFileList.files, function (file) { return file.fileEntry.isFile; });
            payload.data.uploadFileList.files = fileList;
            this.processUpload(payload.data);
          }
          break;
        default:
          break;
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

  onUploadOutput(event) {
  }

  async processUploadSingleFileClickInput(uploadData) {
    if (this.uploadFileListForShowing.length > 0) {
      setTimeout(() => {
        const divToScroll = document.getElementById('upload-file-list').firstElementChild;
        divToScroll.scrollTo(0, divToScroll.scrollHeight);
      }, 0);
    }
    this.showCloseButton = false;
    const fileListForUploadProgress = [];
    for (const file of uploadData.uploadFileList) {
      fileListForUploadProgress.push({
        relativePath: file.name,
        size: file.size,
        processPercentage: 0,
        status: 'Uploading',
        speed: 0,
        start: (new Date()).getTime,
        file: file
      });
    }
    this.uploadFileListForShowing = this.uploadFileListForShowing.concat(fileListForUploadProgress);
    for (const file of fileListForUploadProgress) {
      const listShowIndex = this.uploadFileListForShowing.indexOf(file);
      if (listShowIndex !== -1) {
        if (this.uploadFileListForShowing[listShowIndex].status === 'Canceled') {
          if (listShowIndex === this.uploadFileListForShowing.length - 1) {
            this.showCloseButton = true;
            this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', null);
            continue;
          }
        } else {
          const uploadURLData = uploadData.uploadFrom === 'system-folders'
            ? await this.getURLUploadOfAdminFoldersSystemChild(uploadData.pathForUpload)
            : await this.getURLUploadAPIOfChildFiles(uploadData.repoIDForUpload, uploadData.pathForUpload);
          await this.handleUpload(file, uploadURLData, uploadData.pathForUpload, listShowIndex, uploadData.type);
        }
      }
    }
  }

  async processUpload(uploadData) {
    if (this.uploadFileListForShowing.length > 0) {
      setTimeout(() => {
        const divToScroll = document.getElementById('upload-file-list').firstElementChild;
        divToScroll.scrollTo(0, divToScroll.scrollHeight);
      }, 0);
    }
    this.showCloseButton = false;
    this.uploadFileListForShowing = this.uploadFileListForShowing.concat(uploadData.uploadFileList.files);
    for (const file of uploadData.uploadFileList.files) {
      const listShowIndex = this.uploadFileListForShowing.indexOf(file);
      const fileEntry = file.fileEntry as FileSystemFileEntry;
      if (listShowIndex !== -1) {
        fileEntry.file((realFile: File) => {
          this.uploadFileListForShowing[listShowIndex].processPercentage = 0;
          this.uploadFileListForShowing[listShowIndex].status = 'Uploading';
          this.uploadFileListForShowing[listShowIndex].speed = 0;
          this.uploadFileListForShowing[listShowIndex].start = (new Date()).getTime;
          this.uploadFileListForShowing[listShowIndex].size = realFile.size;
        });
      }
    }
    for (const file of uploadData.uploadFileList.files) {
      const listShowIndex = this.uploadFileListForShowing.indexOf(file);
      if (listShowIndex !== -1) {
        if (this.uploadFileListForShowing[listShowIndex].status === 'Canceled') {
          if (listShowIndex === this.uploadFileListForShowing.length - 1) {
            this.showCloseButton = true;
            this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', null);
            continue;
          }
        } else {
          try {
            const uploadURL = uploadData.uploadFrom === 'system-folders'
              ? await this.getURLUploadOfAdminFoldersSystemChild(uploadData.pathForUpload)
              : await this.getURLUploadAPIOfChildFiles(uploadData.repoIDForUpload, uploadData.pathForUpload);
            await this.handleUpload(file, uploadURL, uploadData.pathForUpload, listShowIndex, uploadData.type);
          } catch (err) {
            const errorObj = JSON.parse(err._body);
            file.status = 'Error';
            file.errorMessage = errorObj.message;
            if (listShowIndex === this.uploadFileListForShowing.length - 1) {
              this.showCloseButton = true;
              this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', null);
            }
          }
        }
      }
    }
  }

  handleUpload(file, uploadData, pathForUpload, listShowIndex, type = '') {
    return new Promise((resolve, reject) => {
      if (uploadData.max_upload_file_size && file.size > uploadData.max_upload_file_size) {
        this.uploadFileListForShowing[listShowIndex].status = 'FileSizeTooLargeError';
        this.uploadFileListForShowing[listShowIndex].maxUploadSizeAllowed = uploadData.max_upload_file_size / 1024 / 1024;
        if (listShowIndex === this.uploadFileListForShowing.length - 1) {
          this.showCloseButton = true;
          this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', null);
        }
      } else if (uploadData.storage_usage + file.size > uploadData.storage_quota) {
        this.uploadFileListForShowing[listShowIndex].status = 'OutOfQuotaError';
        if (listShowIndex === this.uploadFileListForShowing.length - 1) {
          this.showCloseButton = true;
          this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', null);
        }
      } else if (type === 'file-drop') {
        const fileEntry = file.fileEntry as FileSystemFileEntry;
        fileEntry.file((realFile: File) => {
          const formData = this.handleAppendFormData(pathForUpload, file, realFile);
          const xhr = this.xhrAddEventListeners(resolve, listShowIndex);
          this.uploadFileListForShowing[listShowIndex].uploadStartTime = (new Date().getTime());
          this.uploadFileListForShowing[listShowIndex].xhrRequest = xhr;
          this.uploadFileListForShowing[listShowIndex].xhrRequest.open('POST', uploadData.url, true);
          this.uploadFileListForShowing[listShowIndex].xhrRequest.send(formData);
        });
      } else if (type === 'click-input-upload') {
        const formData = this.handleAppendFormData(pathForUpload, file, file.file);
        const xhr = this.xhrAddEventListeners(resolve, listShowIndex);
        this.uploadFileListForShowing[listShowIndex].xhrRequest = xhr;
        this.uploadFileListForShowing[listShowIndex].xhrRequest.open('POST', uploadData.url, true);
        this.uploadFileListForShowing[listShowIndex].xhrRequest.send(formData);
      }
    });
  }

  handleAppendFormData(pathForUpload, file, realFile) {
    const formData: FormData = new FormData();
    pathForUpload !== '/' ? formData.append('parent_dir', pathForUpload + '/') : formData.append('parent_dir', pathForUpload);
    const relativePathArr = file.relativePath.split('/');
    if (relativePathArr.length > 1) {
      formData.append('relative_path', relativePathArr.splice(0, relativePathArr.length - 1).join('/') + '/');
    }
    formData.append('file', realFile, realFile.name);
    return formData;
  }




  // flag

  xhrAddEventListeners(resolve, listShowIndex) {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (ev: ProgressEvent) => this.uploadProcessTracking(ev, listShowIndex));
    xhr.upload.addEventListener('load', (ev: Event) => {
      this.uploadCheckInterval = setInterval(() => {
        if (xhr.status !== 200) {
          this.uploadFileListForShowing[listShowIndex].status = 'Saving';
        } else {
          this.onUploadComplete(listShowIndex, JSON.parse(xhr.response));
          resolve(true);
        }
      }, 1000);
    });
    xhr.upload.addEventListener('error', (ev: Event) => this.onUploadError(ev, listShowIndex));
    xhr.upload.addEventListener('abort', (ev: Event) => this.onUploadCanceled(ev, listShowIndex));
    // setTimeout(() => {
    //   if (xhr.status === 200) {
    //     xhr.upload.addEventListener('loadend', (ev: Event) => resolve(true));
    //   }
    // }, 250);
    // xhr.upload.addEventListener('loadend', (ev: Event) => setTimeout(() => resolve(true), 250));
    return xhr;
  }

  uploadProcessTracking(ev: ProgressEvent, listShowIndex) {
    this.uploadFileListForShowing[listShowIndex].eta = this.caculateETA(ev, this.uploadFileListForShowing[listShowIndex]);
    const completedPercentage = (ev.loaded / ev.total) * 100;
    this.uploadFileListForShowing[listShowIndex].processPercentage = completedPercentage;
  }

  caculateETA(ev: ProgressEvent, currentUploadFile) {
    const total = ev.total;
    const currentChunk = ev.loaded;
    const startTime = currentUploadFile.uploadStartTime;
    const elapsedTime = (new Date().getTime()) - startTime;
    const uploadSpeed = currentChunk / elapsedTime;
    const estimatedTotalTime = total / uploadSpeed;
    const etaInMiliseconds = estimatedTotalTime - elapsedTime;
    const etaMinutes = Math.round(etaInMiliseconds / 1000 / 60);
    const etaSeconds = Math.round(etaInMiliseconds / 1000) % 60;
    return `${etaMinutes}:${etaSeconds}`;
    // const timeLeftInSeconds = (estimatedTotalTime - elapsedTime) / 1000;
    // const withOneDecimalPlace = Math.round(timeLeftInSeconds * 10) / 10;
    // console.log(`convert`, withOneDecimalPlace);
    // const time = new Date(timeLeftInSeconds);
    // console.log(`Time`, time.getUTCHours(), `:`, time.getMinutes(), `:`, time.getMilliseconds());
  }

  onUploadComplete(listShowIndex, xhrResponse) {
    this.uploadFileListForShowing[listShowIndex].status = 'Completed';
    if (this.uploadCheckInterval) {
      clearInterval(this.uploadCheckInterval);
    }
    if (listShowIndex === this.uploadFileListForShowing.length - 1) {
      this.showCloseButton = true;
      this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', xhrResponse[0]);
    }
  }
  onUploadError(ev: Event, listShowIndex) {
    this.uploadFileListForShowing[listShowIndex].status = 'Error';
    if (listShowIndex === this.uploadFileListForShowing.length - 1) {
      this.showCloseButton = true;
      this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', null);
    }
  }

  // onUploadCanceled
  onUploadCanceled(ev: Event, listShowIndex) {
    this.uploadFileListForShowing[listShowIndex].status = 'Canceled';
    if (listShowIndex === this.uploadFileListForShowing.length - 1) {
      this.showCloseButton = true;
      this.messageService.send(Type.Upload_Process_Popup, 'upload-complete', null);
    }
  }

  getURLUploadAPIOfChildFiles(repoID, path) {
    return new Promise((resolve, reject) => this.fileService.getUploadLink(repoID, path).subscribe(
      resp => resolve(resp.data),
      err => {
        return reject(err);
      }
    ));
  }

  getURLUploadOfAdminFoldersSystemChild(path: string) {
    return new Promise((resolve, reject) => this.adminService.getUploadLinkInSysFolders(path)
      .subscribe(resps => resolve(resps.data.upload_link), err => {
        console.log(err);
        return reject(err);
      }));
  }

  cancelUpload(file) {
    if (file.xhrRequest) { file.xhrRequest.abort(); }
    file.status = 'Canceled';
  }

  close() {
    this.uploadFileListForShowing = [];
    this.isHidden = true;
  }

  // (resizeEnd)="onResizeEnd($event)"
  onResizeEnd(event: ResizeEvent): void {
    this.uploadPopupHeightInPx = event.rectangle.height > window.innerHeight ? window.innerHeight - 15 : event.rectangle.height <= 200 ? 200 : event.rectangle.height;
  }
}
