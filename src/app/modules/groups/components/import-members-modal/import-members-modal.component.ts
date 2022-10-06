import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { GroupsService, NotificationService } from '@services/index';
import {TranslateService} from '@ngx-translate/core';

import Papa from 'papaparse';

declare var jQuery: any;

@Component({
  selector: 'app-import-members-modal',
  templateUrl: './import-members-modal.component.html',
  styleUrls: ['./import-members-modal.component.scss']
})
export class ImportMembersModalComponent implements OnInit {

  @Input() groupInfo: any;
  @Output() onImportMembersSuccess = new EventEmitter();

  selectedFile = null;
  isProcessing = false;

  constructor(
    private groupService: GroupsService,
    private noti: NotificationService,
    private translateService: TranslateService,
  ) { }

  ngOnInit() {
  }

  onFileChange(data) {
    this.isProcessing = true;
    const selectedFileArr = data.target.files;
    if (selectedFileArr.length <= 0) {
      this.selectedFile = null;
      return;
    }
    const selectedFile = selectedFileArr[0];
    if (selectedFile.type !== 'text/csv' && selectedFile.type !== 'application/vnd.ms-excel') {
      this.clearFileInput();
      this.noti.showNotification('danger', this.translateService.instant('NOTIFICATION_MESSAGE.ONLY_CSV_FILES_ALLOWED'));
      return;
    }
    this.selectedFile = selectedFile;
    this.addMember();
    this.clearFileInput();
  }

  clearFileInput() {
    jQuery('#csv-file-selector').val('');
  }

  async addMember() {
    if (this.selectedFile === null) {
      this.noti.showNotification('danger', 'You must select a csv file to process');
      this.isProcessing = false;
      return;
    }
    const csvString = await this.readCSVStringFromFile(this.selectedFile);
    const csvData = Papa.parse(csvString);
    const emails = [].concat(...csvData.data);
    this.addMemberToGroup(emails);
  }

  addMemberToGroup(emails: any[]) {
    this.groupService.addMemberToGroupBulk(this.groupInfo.id, emails).subscribe(resp => {
      this.onImportMembersSuccess.emit();
      this.noti.showNotification('success', resp.message);
      this.isProcessing = false;
    }, err => {
      this.noti.showNotification('danger', 'Server error');
      this.isProcessing = false;
    });
  }

  readCSVStringFromFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const fileForRead: File = file;
        const reader: FileReader = new FileReader();
        reader.readAsText(fileForRead);
        reader.onload = (e) => {
          try {
            const csvStr = reader.result;
            resolve(csvStr);
          } catch (error) {
            reject(null);
          }
        };
      } catch (e) {
        reject(null);
      }
    });
  }
}
