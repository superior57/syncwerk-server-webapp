import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';

import { GroupsService, NotificationService } from '@services/index';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-rename-group',
  templateUrl: './rename-group.component.html',
  styleUrls: ['./rename-group.component.scss']
})
export class RenameGroupComponent implements OnInit, AfterViewInit {

  @Input() groupInfo;
  @Output() onRenameGroupSuccess = new EventEmitter();

  @ViewChildren('renameInput') renameInput;

  newGroupName = '';

  constructor(
    private groupService: GroupsService,
    private noti: NotificationService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.newGroupName = this.groupInfo.name;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setFocus();
    }, 500);
  }

  setFocus() {
    this.renameInput.first.nativeElement.focus();
    this.renameInput.first.nativeElement.setSelectionRange(0, this.newGroupName.length);
  }

  renameGroup() {
    if (this.newGroupName.trim().length <= 0) {
      this.noti.showNotification('danger', this.translateService.instant('NOTIFICATION_MESSAGE.YOU_MUST_PROVIDE_A_NEW_NAME_FOR_THE_GROUP'));
      return;
    }
    this.groupService.renameGroup(this.groupInfo.id, this.newGroupName).subscribe(resp => {
      this.noti.showNotification('success', this.translateService.instant('NOTIFICATION_MESSAGE.GROUP_NAME_WAS_RENAMED_SUCCESSFULLY'));
      this.onRenameGroupSuccess.emit();
    }, err => {
      let msg = 'Group rename unsuccessfully';
      if (err._body) {
        const body = JSON.parse(err._body);
        if (body && body.message) {
          msg = body.message;
        }
      }
      this.noti.showNotification('danger', msg);
    });
  }

}
