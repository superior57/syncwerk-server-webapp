import { Component, OnInit, OnDestroy, Input, Renderer, ViewChild, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { setTimeout } from 'core-js/library/web/timers';

import { FilesService, NotificationService, AdminService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-admin-create-child-file-modal',
  templateUrl: './admin-create-child-file-modal.component.html',
  styleUrls: ['./admin-create-child-file-modal.component.scss']
})
export class AdminCreateChildFileModalComponent implements OnInit, OnDestroy {

  @Input() id;
  @Input() parentPath;
  @Input() listFiles;
  @Input() nameFolderFormControl;
  @Input() createType;
  @Input() tail;

  autoFocus = new Subject<boolean>();
  errors: string;
  subError: string;
  @ViewChild('name') input1ElementRef;
  @Output() created: EventEmitter<any> = new EventEmitter<any>();

  nameFolderInvalidChar = ['~', '#', '%', '*', '/', '\\', ':', '<', '>', '?', '|', '.'];
  nameFileInvalidChar = ['~', '#', '%', '*', '/', '\\', ':', '<', '>', '?', '|'];
  dirName = '';

  constructor(
    private noti: NotificationService,
    private translateService: TranslateService,
    private adminService: AdminService,
  ) {
    this.autoFocus.subscribe(data => {
      return new Promise((resolve, reject) => {
        try {
          setTimeout(() => {
            this.input1ElementRef.nativeElement.focus();
            // focus head line
            this.input1ElementRef.nativeElement.setSelectionRange(0, 0);
          }, 500);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.autoFocus) {
      this.autoFocus.unsubscribe();
    }
  }

  closeModal() {
    jQuery('#admin-modal-create-child-file').modal('hide');
  }

  create() {
    const type = this.createType === 'Folder' ? this.translateService.instant('CREATE_FILE_FOLDER_MODAL.NEW_FOLDER') : this.translateService.instant('CREATE_FILE_FOLDER_MODAL.FILE');
    const invalidChar = this.createType === 'Folder' ? this.nameFolderInvalidChar : this.nameFileInvalidChar;

    for (let i = 0; i < invalidChar.length; i++) {
      if (this.dirName.includes(invalidChar[i])) {
        // this.errors = this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.INVALID_MAIN_MESSAGE', {
        //   'type': type,
        //   'character': invalidChar[i]
        // });
        this.errors = this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.INVALID_SUB_MESSAGE');
        this.input1ElementRef.nativeElement.value = '';
        return;
      }
    }

    if (this.tail !== '' && this.dirName === this.tail) {
      this.errors = 'invalid';
      return;
    } else if (this.dirName === '') {
      this.errors = this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.NAME_IS_REQUIRED', {
        'type': type
      });
      return;
    } else {
      this.closeModal();
      this.createType === 'Folder'
        ? this.createFileFolder(this.dirName.trim(), 'dir')
        : this.createFileFolder(this.dirName.trim(), 'file');
    }
  }

  createFileFolder(name: string, type: string) {
    const typeCreate = type === 'dir' ? this.translateService.instant('CREATE_FILE_FOLDER_MODAL.NEW_FOLDER') : this.translateService.instant('CREATE_FILE_FOLDER_MODAL.FILE');
    const path = this.parentPath === '/' ? '/' : this.parentPath;

    this.adminService.postCreateFolderInSysFolders(this.id, path, name).subscribe(resp => {
      this.created.emit();
      this.noti.showNotification('success', this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ADD_SUCCESS', {
        'type': typeCreate
      }));
      this.dirName = '';
      this.input1ElementRef.nativeElement.value = '';
    }, error => {
      this.noti.showNotification('danger', this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.ADD_ERROR', {
        'type': typeCreate
      }));
      this.dirName = '';
    });
  }

  handleAutoFocus() {
    this.errors = '';
    this.subError = '';
    this.autoFocus.next(false);
  }

}
