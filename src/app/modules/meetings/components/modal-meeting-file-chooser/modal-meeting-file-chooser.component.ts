import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, FilesService } from 'app/services';

@Component({
  selector: 'app-modal-meeting-file-chooser',
  templateUrl: './modal-meeting-file-chooser.component.html',
  styleUrls: ['./modal-meeting-file-chooser.component.scss']
})
export class ModalMeetingFileChooserComponent implements OnInit {

  @Output() submitFileEvent = new EventEmitter<any>()

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
    itemsPerPage: 10,
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
      this.fileListFromAPI = resp.data.map(file => {
        file.selected = false
        return file;
      });
      // for (const file of this.fileListFromAPI) {
      //   if (file.repo.id === this.currentSelectedFolderId && this.currentSelectedPath === (file.parent_dir + file.name)) {
      //     this.chooseFile(file);
      //     continue;
      //   }
      // }
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

  selectFile(file, event) {
    const fileIndex = this.fileListFromAPI.findIndex(f => this.filePath(f) === this.filePath(file));
    if (fileIndex > -1) {
      this.fileListFromAPI[fileIndex].selected = event.target.checked;
    }
  }

  filePath(file) {
    return `${file.repo.id}${file.parent_dir}${file.name}`;
  }

  submitFiles() {
    const selectedFiles = this.fileListFromAPI.filter(file => file.selected);
    if (selectedFiles.length == 0) {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.SETTINGS.CMS.MESSAGES.SELECT_FILE_REQUIRED'));
      return false;
    }
    const files = selectedFiles.map(file => this.filePath(file));
    this.submitFileEvent.emit({ files });
    this.bsModalRef.hide();
  }

  closeModal() {
    this.bsModalRef.hide();
  }
}
