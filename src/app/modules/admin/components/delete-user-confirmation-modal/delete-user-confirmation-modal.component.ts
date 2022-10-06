import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AdminService, NotificationService } from 'app/services';

@Component({
  selector: 'app-delete-user-confirmation-modal',
  templateUrl: './delete-user-confirmation-modal.component.html',
  styleUrls: ['./delete-user-confirmation-modal.component.scss']
})
export class DeleteUserConfirmationModalComponent implements OnInit {

  @Input() userListForDelete = [];
  @Output() onDeleteSuccess = new EventEmitter();
  @Output() onBatchDeleteSuccess = new EventEmitter();

  isProcessing = false;
  // for single user delete
  userForDelete = '';
  deleteMode = 'single';

  constructor(
    private adminService: AdminService,
    private noti: NotificationService,
  ) { }

  ngOnInit() {
    if (this.userListForDelete.length <= 1) {
      this.deleteMode = 'single';
      this.userForDelete = this.userListForDelete[0];
    } else {
      this.deleteMode = 'batch';
    }
  }

  deleteUser() {
    this.isProcessing = true;
    if (this.deleteMode === 'single') {
      this.adminService.deleteUser(this.userListForDelete[0]).subscribe(resp => {
        this.onDeleteSuccess.emit({
          message: resp.message,
          deletedUsers: this.userListForDelete,
        });
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        this.isProcessing = false;
      });
    } else {
      this.adminService.postBatchUserProcessing(this.userListForDelete, 'delete-user').subscribe(resp => {
        this.noti.showNotification('success', resp.message);
        this.onBatchDeleteSuccess.emit(resp.data);
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        this.isProcessing = false;
      });
    }
  }
}
