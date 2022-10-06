import { Component, OnInit, OnDestroy, Input, Renderer, ViewChild, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { setTimeout } from 'core-js/library/web/timers';

import { FilesService, NotificationService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-child-file-create-new-modal',
  templateUrl: './child-file-create-new-modal.component.html',
  styleUrls: ['./child-file-create-new-modal.component.scss']
})
export class ChildFileCreateNewModalComponent implements OnInit, OnDestroy {

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

  nameFolderInvalidChar = ['~', '#', '%', '*', '/', '\\', ':', '<', '>', '?', '|'];
  nameFileInvalidChar = ['~', '#', '%', '*', '/', '\\', ':', '<', '>', '?', '|'];

  constructor(
    private filesService: FilesService,
    private noti: NotificationService,
    private router: Router,
    private _renderer: Renderer,
    private translateService: TranslateService
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
    jQuery('#modal-create-child-file').modal('hide');
  }

  create(name) {
    this.nameFolderFormControl.markAsTouched();

    const type = this.createType === 'Folder' ? this.translateService.instant('CREATE_FILE_FOLDER_MODAL.NEW_FOLDER') : this.translateService.instant('CREATE_FILE_FOLDER_MODAL.FILE');
    if (this.tail !== '' && name === this.tail) {
      this.errors = 'invalid';
      return;
    } else if (this.nameFolderFormControl.hasError('required')) {
      this.errors = this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.NAME_IS_REQUIRED', {
        'type': type
      });
      return;
    } else if (this.nameFolderFormControl.hasError('pattern')) {
      const invalidChar = this.createType === 'Folder' ? this.nameFolderInvalidChar : this.nameFileInvalidChar;
      this.errors = this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.PLEASE_ENTER_VALID_NAME');
      for (let i = 0; i <= invalidChar.length; i++) {
        if (name.includes(invalidChar[i])) {
          this.errors = this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.INVALID_MAIN_MESSAGE', {
            'type': type,
            'character': invalidChar[i]
          });
          this.subError = this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.INVALID_SUB_MESSAGE');
        }
      }
      return;
    }
    this.closeModal();
    this.createType === 'Folder'
      ? this.createFileFolder(name.trim(), 'dir')
      : this.createFileFolder(name.trim(), 'file');
  }

  createFileFolder(name: string, type: string) {
    const typeCreate = type === 'dir' ? this.translateService.instant('CREATE_FILE_FOLDER_MODAL.NEW_FOLDER') : this.translateService.instant('CREATE_FILE_FOLDER_MODAL.FILE');
    const path = this.parentPath === '/' ? '/' + name : this.parentPath + '/' + name;
    this.filesService.createFileFolder(this.id, path, type).subscribe(resp => {
      this.created.emit();
      this.noti.showNotification('success', this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ADD_SUCCESS', {
        'type': typeCreate
      }));
    }, error => {
      this.noti.showNotification('danger', this.translateService.instant('CREATE_FILE_FOLDER_MODAL.ERROR_MESSAGE.ADD_ERROR', {
        'type': typeCreate
      }));
    });
  }

  handleAutoFocus() {
    this.errors = '';
    this.subError = '';
    this.autoFocus.next(false);
  }
}
