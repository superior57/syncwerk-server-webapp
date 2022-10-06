import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AdminService, NotificationService, AuthenticationService } from 'app/services';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';

declare const jQuery: any;

@Component({
  selector: 'app-useradmin-info-meetings',
  templateUrl: './useradmin-info-meetings.component.html',
  styleUrls: ['./useradmin-info-meetings.component.scss']
})
export class UseradminInfoMeetingsComponent implements OnInit {

  @Input() listMeetings = [];
  @Output() deleteReloadData = new EventEmitter;

  @ViewChild(ModalDeleteRemoveComponent) modalDeleteRemoveComponent;

  Math: any;
  isOpenModal = {
    delete: false,
  };
  currentItem: any;
  params: any;

  currentUserPermission: any = {
    can_manage_meeting: false,
  };

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private authService: AuthenticationService,
  ) {
    this.Math = Math;
  }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp1 => {
      this.currentUserPermission = resp1.data.permissions;
    });
  }

  handleOpenModal(typeModal: string) {
    if (typeModal === 'delete') {
      this.isOpenModal.delete = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.delete = false);
    }
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  deleteItem(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal('delete');
  }

  displayStatus(status: string) {
    switch(status) {
      case 'STOPPED':
        return 'Stopped';
        break;
      case 'IN_PROGRESS':
        return 'In progress';
        break;
      default:
        return '';
    }
  }

  onSubmitDeleteItem() {
    this.adminService.removeMeeting(this.currentItem.id).subscribe(
      resps => {
        this.deleteReloadData.emit({ message_success: resps.message });
      }, error => {
        console.error('useradmin info delete meeting: ', error);
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

}
