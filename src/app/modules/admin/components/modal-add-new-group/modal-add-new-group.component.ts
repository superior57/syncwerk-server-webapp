
import {map} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { AdminService, AuthenticationService, NotificationService } from 'app/services';

@Component({
  selector: 'app-modal-add-new-group',
  templateUrl: './modal-add-new-group.component.html',
  styleUrls: ['./modal-add-new-group.component.scss']
})
export class ModalAddNewGroupComponent implements OnInit {

  isProcessing = false;
  selectedUsers = [];
  currentUserInfo: any = {};
  groupName = '';

  constructor(
    public bsModalRef: BsModalRef,
    private adminService: AdminService,
    private authService: AuthenticationService,
    private notify: NotificationService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.authService.userInfo().subscribe(resp => {
      console.log('current user info', resp);
      this.currentUserInfo = resp.data;
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

  addGroups() {
    if (this.groupName.trim() === '') {
      this.notify.showNotification('danger', this.translate.instant('CREATE_FILE_FOLDER_MODAL.DANGER_MODAL'));
      return false;
    }
    let selectedUserEmail;
    if (this.selectedUsers.length <= 0) {
      selectedUserEmail = this.currentUserInfo.email;
    } else {
      selectedUserEmail = this.selectedUsers[0].value;
    }

    this.adminService.postCreateGroup(this.groupName, selectedUserEmail).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('CREATE_FILE_FOLDER_MODAL.CREATE_MODAL'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    });
  }

}
