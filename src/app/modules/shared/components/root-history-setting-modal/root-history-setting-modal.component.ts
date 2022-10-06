import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { FoldersModel } from 'app/Models/Folder.model';
import { Type } from '@enum/index.enum';
import { MessageService, NotificationService, FilesService } from '@services/index';
import { NonAuthenticationService } from '@services/non-authentication.service';
import { TranslateService } from "@ngx-translate/core";

declare var jQuery: any;

@Component({
  selector: 'app-root-history-setting-modal',
  templateUrl: './root-history-setting-modal.component.html',
  styleUrls: ['./root-history-setting-modal.component.scss']
})
export class RootHistorySettingModalComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  @Input() Folder: FoldersModel;
  option;
  keep_days;
  dayRegex = /^[0-9]+$/;
  dayErrorMessage;
  disabledByAdmin = false;
  disableEditHistoryLimit = false;

  constructor(
    private filesService: FilesService,
    private messageService: MessageService,
    private nonAuthenService: NonAuthenticationService,
    private translateService: TranslateService,
    private notify: NotificationService
  ) {
    this.subscribe();
  }

  ngOnInit() {
    const key = 'ENABLE_REPO_HISTORY_SETTING';
    this.nonAuthenService.getRestapiSettingsByKeys(key).subscribe(resp => {
      this.disabledByAdmin = resp.data.config_dict[key] === 0;
    });
  }

  subscribe() {
    this.subscription = this.messageService
      .subscribe(Type.History_Setting_Modal, (payload) => {
        this.initData();
        this.getHistoryLimit(payload.folderId);
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

  initData() {
    this.option = null;
    this.keep_days = null;
    this.dayErrorMessage = '';
  }

  getHistoryLimit(folderId: string) {
    this.filesService.getFolderHistoryLimit(folderId)
      .subscribe(resp => {
        this.handleResponseData(resp);
      }, error => {
      });
  }

  handleResponseData(resp) {
    this.option = resp.data.keep_days;
    this.keep_days = '30';
    // Handle can edit history
    this.disableEditHistoryLimit = !resp.data.can_edit;

    if (this.option > 0) {
      this.keep_days = String(this.option);
    } else {
      this.disableEditHistoryLimit = true;
    }
  }

  setHistoryLimit() {
    let day = 0;
    if (this.option <= 0) {
      day = this.option;
    } else {
      const keep_days = this.keep_days.trim();
      if (keep_days.length <= 0) {
        this.dayErrorMessage = this.translateService.instant('FORMS.REQUIRED.DAYS');
        return;
      }
      if (this.dayRegex.test(keep_days)) {
        if (keep_days > 90) {
          this.dayErrorMessage = this.translateService.instant('HISTORY.SETTING.PERIOD_CANNOT_EXCEED');
          return;
        }
      } else {
        this.dayErrorMessage = this.translateService.instant('FORMS.INVALID.DAYS');
        return;
      }
      day = keep_days;
    }
    this.filesService.setFolderHistoryLimit(this.Folder.id, String(day))
      .subscribe(resp => {
        this.closeModal();
      }, error => {
        this.notify.showNotification('danger', this.translateService.instant('NOTIFY_MSG.DANGER.ACCESS_DENINED.SUB_TITLE'));
      });
  }

  closeModal() {
    this.initData();
    jQuery('#history-setting-modal').modal('hide');
  }

  keyPress(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !this.dayRegex.test(inputChar)) {
      event.preventDefault();
    }
  }
}
