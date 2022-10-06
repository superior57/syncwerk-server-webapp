
import {map} from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { GroupsService, NotificationService, NonAuthenticationService, AuthenticationService } from '@services/index';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-transfer-group',
  templateUrl: './transfer-group.component.html',
  styleUrls: ['./transfer-group.component.scss']
})
export class TransferGroupComponent implements OnInit {

  @Input() groupInfo;
  @Output() onTransferGroupSuccess = new EventEmitter();

  memberToTransfer = [];
  ENABLE_GLOBAL_ADDRESSBOOK = true;

  constructor(
    private groupService: GroupsService,
    private noti: NotificationService,
    private translateService: TranslateService,
    private nonAuthenticationService: NonAuthenticationService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.nonAuthenticationService.getRestapiSettingsByKeys('ENABLE_GLOBAL_ADDRESSBOOK').subscribe((resp) => {
      if (resp.data.config_dict.ENABLE_GLOBAL_ADDRESSBOOK) {
        this.authService.userInfo().subscribe(resp1 => {
          if (resp1.data.permissions.can_use_global_address_book === false) {
            this.ENABLE_GLOBAL_ADDRESSBOOK = false;
          } else {
            this.ENABLE_GLOBAL_ADDRESSBOOK = true;
          }
        });
      } else {
        this.ENABLE_GLOBAL_ADDRESSBOOK = false;
      }
    });
  }

  handleNameUserList(nameStr: string, limitStr: number = 35) {
    const name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    return name;
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.groupService.searchUser(text).pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: this.handleNameUserList(user.name),
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  transferGroup() {
    if (this.memberToTransfer.length <= 0) {
      this.noti.showNotification('danger', this.translateService.instant('NOTIFICATION_MESSAGE.YOU_MUST_PROVIDE_A_NEW_NAME_FOR_THE_GROUP'));
      return;
    }
    if (this.memberToTransfer[0].value.trim().toLowerCase() === this.groupInfo.owner.email.trim().toLowerCase()) {
      this.noti.showNotification('danger', this.translateService.instant('NOTIFICATION_MESSAGE.THE_OWNER_OF_THE_GROUP', {'display': this.memberToTransfer[0].display}));
      return;
    }
    this.groupService.transferGroup(this.groupInfo.id, this.memberToTransfer[0].value).subscribe(resp => {
      this.noti.showNotification('success', this.translateService.instant('NOTIFICATION_MESSAGE.GROUP_WAS_TRANSFERRED_SUCCESSFULLY'));
      this.onTransferGroupSuccess.emit();
    }, err => {
      this.noti.showNotification('danger', this.translateService.instant('NOTIFICATION_MESSAGE.EMAIL_INVALID', {'userName': this.memberToTransfer[0].display}));
      // this.noti.showNotification('danger', JSON.parse(err._body).message);
    });
  }

}
