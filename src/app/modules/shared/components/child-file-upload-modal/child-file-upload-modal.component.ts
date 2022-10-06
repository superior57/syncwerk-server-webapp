import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { DropzoneComponent, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

import { Type } from '@enum/index.enum';
import { FoldersModel } from 'app/Models/Folder.model';
import { FilesService, NotificationService, MessageService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-child-file-upload-modal',
  templateUrl: './child-file-upload-modal.component.html',
  styleUrls: ['./child-file-upload-modal.component.scss']
})
export class ChildFileUploadModalComponent implements OnInit, AfterViewInit {
  private subscription: Subscription;
  @ViewChild(DropzoneComponent) componentRef: DropzoneComponent;

  @Input() currentRepoId;
  @Input() currentPath;
  @Output() uploaded: EventEmitter<any> = new EventEmitter<any>();

  files = [];
  isError: boolean;
  isProcessing = false;

  public configUploadLink: DropzoneConfigInterface = {
    url: 'http://localhost/seafhttp/upload-api/',
    autoProcessQueue: false,
    autoQueue: false,
    addRemoveLinks: true,
    maxFilesize: 0,
    // maxThumbnailFilesize:  100,
    dictRemoveFile: '',
    dictCancelUpload: '',
    clickable: true,
    timeout: 0,
    init: function() {
      this.on('processing', function(file) {

        if (file.size > file.max_size_upload) {
          this.options.dictUploadCanceled = file.max_size_error_message;
          this.cancelUpload(file);
        } else if (file.owner_storage_usage + file.size > file.owner_storage_quota) {
          this.options.dictUploadCanceled = file.out_of_quota_error_message;
          this.cancelUpload(file);
        }
      });
    }
  };


  constructor(
    private cookieService: CookieService,
    private filesService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit() {
    this.isError = false;
  }

  ngAfterViewInit() {
    this.initData();
  }

  initData() {
    this.componentRef.directiveRef.dropzone.autoDiscover = false;
    this.componentRef.directiveRef.dropzone.options.params = {
      'parent_dir': this.currentPath,
    };

    this.componentRef.directiveRef.dropzone.options.headers = {
      'Cache-Control': null,
      'X-Requested-With': null,
    };
    this.componentRef.directiveRef.reset();
  }

  onAddedfile(file) {
    this.files.push(file);
  }

  onRemoveFile(file) {
    this.files.splice(this.files.indexOf(file), 1);
  }

  onQueueComplete(args) {
    if (!this.isError) {
      this.noti.showNotification('success', this.translateService.instant('UPLOAD_FILES_FOLDERS.UPLOADED'));
      this.uploaded.emit();
      jQuery('#upload-child-file-modal').modal('hide');
    }
  }

  onComplete(args) {
    console.log('complete args', args);
    if (args.status === 'success') {
      if (this.files.length > 0) {
        this.upload();
      } else {
        this.isProcessing = false;
      }
    } else if (args.status === 'canceled') {
      this.isError = true;
      this.isProcessing = false;
    } else {
      this.isError = true;
      if (this.files.length > 0) {
        this.upload();
      } else {
        this.isProcessing = false;
      }
      // this.noti.showNotification('danger', this.translateService.instant('UPLOAD_FILES_FOLDERS.UPLOAD_ERROR'));
    }
  }

  upload() {
    this.isProcessing = true;
    if (this.files.length > 0) {
      const currentFile = this.files.shift();
      this.getUploadLink(currentFile);
    } else {
      this.isProcessing = false;
      this.noti.showNotification('danger', this.translateService.instant('UPLOAD_FILES_FOLDERS.NO_FILE_EXISTS_TO_UPLOAD'));
    }
  }

  getUploadLink(file: any) {
    this.filesService.getUploadLink(this.currentRepoId, this.currentPath)
      .subscribe(resp => {
        file.max_size_upload = resp.data.max_upload_file_size;
        file.owner_storage_quota = resp.data.storage_quota;
        file.owner_storage_usage = resp.data.storage_usage;
        file.max_size_error_message = this.translateService.instant('UPLOAD_FILES_FOLDERS.FILE_SIZE_TOO_LARGE', {max_size: file.max_size_upload / 1024 / 1024});
        file.out_of_quota_error_message = this.translateService.instant('UPLOAD_FILES_FOLDERS.OUT_OF_QUOTA');
        if ('fullPath' in file) {
          this.handleUploadFolderLimit(file.fullPath, file, resp.data.url);
        } else {
          this.handleUploadLink(resp.data.url, file);
        }
      }, error => {
        console.error(error);
        const errorObj = JSON.parse(error._body);
        this.noti.showNotification('danger', errorObj.message);
        const dropzone = this.componentRef.directiveRef.dropzone;
        dropzone.removeAllFiles();
        this.isProcessing = false;
      });
  }

  handleUploadLink(url: string, file: any) {
    const dropzone = this.componentRef.directiveRef.dropzone;
    dropzone.options.url = url + '?ret-json=1';
    dropzone.enqueueFile(file);
    dropzone.processQueue();
  }

  getRelativePath(path: string) {
    const dividePath = path.split('/');
    dividePath.pop();
    const relativePath = dividePath.join('/') + '/';
    return relativePath;
  }

  handleUploadFolderLimit(path: string, file: any[], url: string) {
    const pathFolderArr = path.split('/');
    pathFolderArr.pop();
    if (pathFolderArr.length < 5) {
      this.componentRef.directiveRef.dropzone.options.params.relative_path = this.getRelativePath(path);
      this.handleUploadLink(url, file);
    } else {
      this.noti.showNotification('danger', this.translateService.instant('UPLOAD_FILES_FOLDERS.THE_FILE_EXCEEDS_LEVEL_5'));
      this.componentRef.directiveRef.dropzone.cancelUpload(file);
    }
  }

  // onUploadError([file, errorMessage, isFromXHR]) {
  //   console.log({file, errorMessage, isFromXHR});
  // }
}
