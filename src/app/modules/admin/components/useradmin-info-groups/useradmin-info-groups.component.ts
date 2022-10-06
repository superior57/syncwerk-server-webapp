import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AdminService, NotificationService, AuthenticationService } from 'app/services';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';

declare const jQuery: any;

@Component({
  selector: 'app-useradmin-info-groups',
  templateUrl: './useradmin-info-groups.component.html',
  styleUrls: ['./useradmin-info-groups.component.scss']
})
export class UseradminInfoGroupsComponent implements OnInit {

  @Input() listGroups = [];
  @Output() deleteReloadData = new EventEmitter;

  @ViewChild(ModalDeleteRemoveComponent) modalDeleteRemoveComponent;

  Math: any;
  isOpenModal = {
    delete: false,
  };
  currentItem: any;
  params: any;

  currentUserPermission: any = {
    can_manage_group: false,
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

  onSubmitDeleteItem() {
    this.adminService.deleteUserInfoGroup(this.currentItem.id).subscribe(
      resps => {
        this.deleteReloadData.emit({ message_success: resps.message });
      }, error => {
        console.error('useradmin info delete groups: ', error);
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }
}
