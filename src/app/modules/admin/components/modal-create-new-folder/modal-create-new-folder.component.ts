import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AdminService, NotificationService } from 'app/services';

declare const jQuery: any;

@Component({
  selector: 'app-modal-create-new-folder',
  templateUrl: './modal-create-new-folder.component.html',
  styleUrls: ['./modal-create-new-folder.component.scss']
})
export class ModalCreateNewFolderComponent implements OnInit {

  @Input() repoID: string;
  @Input() currentPath: string;
  @Output() created = new EventEmitter;

  @ViewChild('name') inputName: ElementRef;

  model = {
    name: '',
  };
  isProcessing = false;
  nameErrorMessage = '';
  nameFolderInvalidChar = ['~', '#', '%', '*', '/', '\\', ':', '<', '>', '?', '|', '.'];
  subError = '';

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
    setTimeout(() => this.inputName.nativeElement.focus(), 600);
  }

  submitCreateFolder() {
    if (this.checkValidationForm()) {
      this.isProcessing = true;
      this.adminService.postCreateFolderInSysFolders(this.repoID, this.currentPath, this.model.name).subscribe(
        resps => {
          this.created.emit(resps.message);
        }, error => {
          this.isProcessing = false;
          this.inputName.nativeElement.focus();
          this.notification.showNotification('danger', JSON.parse(error._body).message);
        });
    }
  }

  checkValidationForm() {
    this.nameErrorMessage = '';
    for (let i = 0; i <= this.nameFolderInvalidChar.length; i++) {
      if (this.model.name.includes(this.nameFolderInvalidChar[i])) {
        this.nameErrorMessage = 'Folder name should not include \'' + this.nameFolderInvalidChar[i] + '\'';
        this.subError = 'A valid name must contain only letters, numbers, and hyphens/underscores.';
        this.inputName.nativeElement.focus();
        return false;
      }
    }
    return true;
  }
}
