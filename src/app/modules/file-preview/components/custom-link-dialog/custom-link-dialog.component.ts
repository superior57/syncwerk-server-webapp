import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, FilesService, AdminService } from 'app/services';

@Component({
  selector: 'app-custom-link-dialog',
  templateUrl: './custom-link-dialog.component.html',
  styleUrls: ['./custom-link-dialog.component.scss']
})
export class CustomLinkDialogComponent implements OnInit {

  linkToInsert = '';
  isOpenInNewTab = false;

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

  currentSearchQuery = '';

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  linkSrc = 'custom'; // can be 'custom' or 'existingPage'

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private fileService: FilesService,
    public bsModalRef: BsModalRef,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.processes.isLoadingFileList = true;
    this.searchFile();
  }

  searchFile() {
    this.fileService.getSearchFile('html', this.currentSearchQuery).subscribe(resp => {
      console.log(resp);
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

  pageChanged(data) {
    this.pagination = data;
    this.handlePagination();
  }


  onLinkSrcChange() {
    console.log(this.linkSrc);
  }

  onSelectFile(file) {
    this.linkToInsert = `preview/${file.repo.id}/?p=${file.parent_dir}${file.name}#existingPage#${file.repo.id}#${file.parent_dir}${file.name}`;
  }

  insertLink() {
    if (this.linkToInsert.trim()) {

      if (this.linkSrc === 'existingPage') {
        this.bsModalRef.hide();
      } else {
        this.linkToInsert = `${this.linkToInsert}#custom#${this.isOpenInNewTab}`;
      }
      // if (this.isOpenInNewTab) {
      //   this.linkToInsert = `openInNewTab=true--${this.linkToInsert}`;
      // }
      this.bsModalRef.hide();
    } else {
      this.notify.showNotification('danger', this.translate.instant('PREVIEW.MODALS.INSERT_LINK.PLEASE_PROVIDE_LINK_MESSAGE'));
    }
  }

  cancel() {
    this.linkToInsert = '';
    this.bsModalRef.hide();
  }

}
