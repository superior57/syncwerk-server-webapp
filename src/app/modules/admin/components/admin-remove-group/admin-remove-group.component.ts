import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AdminService, NotificationService } from 'app/services';

import { TranslateService } from "@ngx-translate/core";


@Component({
  selector: 'app-admin-remove-group',
  templateUrl: './admin-remove-group.component.html',
  styleUrls: ['./admin-remove-group.component.scss']
})
export class AdminRemoveGroupComponent implements OnInit {

  @Input() groupInfo: any = {};
  @Output() onRemoveGroupSuccess = new EventEmitter();

  isProcessing = false;

  constructor(
    private adminService: AdminService,
    private notify: NotificationService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    console.log(this.groupInfo);
  }

  removeGroup() {
    this.isProcessing = true;
    this.adminService.deleteGroup(this.groupInfo.id).subscribe(resp => {
      console.log(resp);
      this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.REMOVE_GROUP_SUCCESS'));
      this.onRemoveGroupSuccess.emit();
    }, err => {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.GROUPS.MESSAGES.REMOVE_GROUP_FAILED'));
      console.log(err);
      this.isProcessing = false;
    });
  }

}
