
import {map} from 'rxjs/operators';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs';

import { AdminService, NotificationService, AuthenticationService } from 'app/services';

@Component({
  selector: 'app-add-admins-modal',
  templateUrl: './add-admins-modal.component.html',
  styleUrls: ['./add-admins-modal.component.scss']
})
export class AddAdminsModalComponent implements OnInit {

  @Output() onAddAdminsSuccess = new EventEmitter();

  adminListForAdd = [];
  isProcessing = false;

  ENABLE_GLOBAL_ADDRESSBOOK = true;

  constructor(
    private adminService: AdminService,
    private noti: NotificationService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.adminService.getRestapiSettingsByKeys('ENABLE_GLOBAL_ADDRESSBOOK').subscribe((resp) => {
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

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.adminService.getSearchUserForAddAsAdmin(text).pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: user.name,
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }

  addAdmins() {
    this.isProcessing = true;
    if (this.adminListForAdd.length <= 0) {
      this.noti.showNotification('danger', 'You need to choose at least 1 user to process');
      return;
    }
    const listUsersForMadeAdmin = [];
    for (const user of this.adminListForAdd) {
      listUsersForMadeAdmin.push(user.value);
    }
    this.adminService.postAddAdmins(listUsersForMadeAdmin).subscribe(resp => {
      this.onAddAdminsSuccess.emit(resp);
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
      this.isProcessing = false;
    });
  }

}
