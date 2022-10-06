import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, FilesService, AdminService, MessageService } from 'app/services';
import { Action, Type } from '@enum/index.enum';
import { ActivatedRoute } from '@angular/router';


// import { Type } from '@angular/compiler/src/core';

@Component({
  selector: 'app-custom-image-dialog',
  templateUrl: './custom-image-dialog.component.html',
  styleUrls: ['./custom-image-dialog.component.scss']
})
export class CustomImageDialogComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput;

  private subscription: Subscription;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private fileService: FilesService,
    public bsModalRef: BsModalRef,
    private adminService: AdminService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  repoID: any = {};
  currentPath = '';

  fileListFromAPI = [];
  fileListForDisplay = [];
  processes = {
    isLoadingFileList: false,
    isProcessingChangingSetting: false,
  };
  selectedFile: any = null;

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  linkSrc = '';
  linkToImage = '';
  imgDirectLink = '';
  currentSearchQuery = '';
  listFormatTypeImage = ['jpeg', 'png', 'jpg'];
  imageThumbnailUrl: string = null;

  imgSrc = 'upload-file';
  existingImgSelectedImg = null;

  ngOnInit() {
    this.subscribe();
    this.processes.isLoadingFileList = true;
    this.searchFile();
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Upload_Process_Popup, (payload) => {
      switch (payload.action.toLowerCase()) {
        case 'upload-complete':
          let uploadPath = '/';
          if (this.currentPath !== '/') {
            uploadPath = `${this.currentPath}/`;
          }
          const thumbnailLink = this.fileService.getThumbnailImage(this.repoID, `${uploadPath}${payload.data.name}`, '350').subscribe(resps => {
            this.imageThumbnailUrl = resps.url;
            this.bsModalRef.hide();
          });

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

  onSelectImage(selectedImageFile) {
    for (const imageFile of this.fileListForDisplay) {
      imageFile.isSelected = false;
    }
    if (selectedImageFile === null) {
      this.existingImgSelectedImg = null;
    } else {
      selectedImageFile.isSelected = true;
      this.existingImgSelectedImg = selectedImageFile;
    }
  }


  searchFile() {
    this.fileService.getSearchFile(this.listFormatTypeImage, this.currentSearchQuery).subscribe(resp => {
      this.fileListFromAPI = resp.data;
      this.processes.isLoadingFileList = false;
      this.handlePagination();
    });
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.fileListForDisplay = Object.assign([], this.fileListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.fileListFromAPI = this.fileListFromAPI.filter(ele => ele.name.toLowerCase().includes(this.currentSearchQuery));
      }
      this.fileListForDisplay = this.fileListFromAPI.slice(start, end);
      for (const imageFile of this.fileListForDisplay) {
        imageFile.thumbnailUrl = this.fileService.populateThumbnailImageLink(
          imageFile.repo.id,
          `${imageFile.parent_dir}${imageFile.name}`,
          '40'
        );
      }
    }
  }

  onSearchFilterChange(data) {
    const currentTimeStamp = new Date();
    if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
      clearTimeout(this.searchTimeOut);
    }
    this.searchChangeTimeStamp = currentTimeStamp;
    this.searchTimeOut = setTimeout(() => {
      this.selectedFile = null;
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.searchFile();
    }, this.searchDelayInMilliseconds);
  }

  onLinkSrcChange(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile.type.includes('image/')) {
      this.notify.showNotification('danger', this.translate.instant('PREVIEW.MODALS.INSERT_IMAGE.INVALID_IMAGE'));
      e.target.value = '';
    } else {
      this.linkToImage = e.target.files;
    }
  }

  insertImage() {
    if (this.imgSrc === 'upload-file') {
      if (this.linkToImage === '' || this.linkToImage.length === 0) {
        this.notify.showNotification('danger', this.translate.instant('PREVIEW.MODALS.INSERT_IMAGE.PLEASE_PROVIDE_IMAGE'));
        return false;
      }
      console.log('this is upload imae', this.linkToImage);
      this.messageService.send(Type.Upload_Process_Popup, 'show', {
        uploadFileList: this.linkToImage,
        repoIDForUpload: this.repoID,
        pathForUpload: this.currentPath,
        type: 'click-input-upload'
      });
    } else if (this.imgSrc === 'direct-link') {
      const regex = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
      if (regex.test(this.imgDirectLink)) {
        this.imageThumbnailUrl = this.imgDirectLink;
        this.bsModalRef.hide();
      } else {
        this.notify.showNotification('danger', this.translate.instant('PREVIEW.MODALS.INSERT_IMAGE.URL_INVALID'));
      }


    } else {
      if (this.existingImgSelectedImg === null) {
        this.notify.showNotification('danger', this.translate.instant('PREVIEW.MODALS.INSERT_IMAGE.PLEASE_SELECT_IMAGE'));
        return false;
      }
      // this.imageThumbnailUrl = this.existingImgSelectedImg.thumbnailUrl;
      this.imageThumbnailUrl = this.fileService.populateThumbnailImageLink(
        this.existingImgSelectedImg.repo.id,
        `${this.existingImgSelectedImg.parent_dir}${this.existingImgSelectedImg.name}`,
        '350'
      );
      this.bsModalRef.hide();
    }

  }

  cancel() {
    this.linkToImage = '';
    this.imageThumbnailUrl = null;
    this.bsModalRef.hide();
  }

}
