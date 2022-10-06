import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, FilesService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-cms-file-chooser',
  templateUrl: './modal-cms-file-chooser.component.html',
  styleUrls: ['./modal-cms-file-chooser.component.scss']
})
export class ModalCmsFileChooserComponent implements OnInit {
  settingKey = '';
  allowedExt = '';
  currentValue = '';

  currentSelectedFolderId = '';
  currentSelectedPath = '';

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

  maxSize = 5;

  currentSearchQuery = '';

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private fileService: FilesService,
    public bsModalRef: BsModalRef,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    if (this.currentValue !== '') {
      const currentPathArr = this.currentValue.split('/');
      this.currentSelectedFolderId = currentPathArr.shift();
      this.currentSelectedPath = `/${currentPathArr.join('/')}`;
    }
    this.processes.isLoadingFileList = true;
    this.searchFile();
  }

  searchFile() {
    this.fileService.getSearchFile(this.allowedExt, this.currentSearchQuery).subscribe(resp => {
      this.fileListFromAPI = resp.data;
      for (const file of this.fileListFromAPI) {
        if (file.repo.id === this.currentSelectedFolderId && this.currentSelectedPath === (file.parent_dir + file.name)) {
          this.chooseFile(file);
          break;
        }
      }
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

  chooseFile(file) {
    this.selectedFile = file;
  }

  updateSetting() {
    if (!this.selectedFile) {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.SETTINGS.CMS.MESSAGES.SELECT_FILE_REQUIRED'));
      return false;
    }
    if (!this.settingKey || !this.settingKey.trim()) {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.SETTINGS.CMS.MESSAGES.SETTING_KEYS_REQUIRED'));
      return false;
    }
    this.processes.isProcessingChangingSetting = true;
    const settingString = `${this.selectedFile.repo.id}${this.selectedFile.parent_dir}${this.selectedFile.name}`;
    this.adminService.settingSystemAdmin(this.settingKey, settingString).subscribe(resp2 => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.SETTINGS.UPDATE_SETTING_SUCCESSFULLY'));
      this.bsModalRef.hide();
    });
  }

}
