import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { AdminService, NotificationService, AuthenticationService } from 'app/services';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';
import { TransferFolderModalComponent } from '@shared/components/transfer-folder-modal/transfer-folder-modal.component';

declare const jQuery: any;

@Component({
  selector: 'app-useradmin-info-owned-folders',
  templateUrl: './useradmin-info-owned-folders.component.html',
  styleUrls: ['./useradmin-info-owned-folders.component.scss']
})
export class UseradminInfoOwnedLibsComponent implements OnInit {

  @Input() dataOwnedRepos = [];
  @Input() email: string;
  @Output() deleteReloadData = new EventEmitter;
  @Output() transferReloadData = new EventEmitter;

  @ViewChild(ModalDeleteRemoveComponent) modalDeleteRemoveComponent;
  @ViewChild(TransferFolderModalComponent) transferFolderModalComponent;

  isOpenModal = {
    delete: false,
    transfer: false,
  };
  currentItem: any;
  params: any;
  enableViewRepo = false;

  currentUserPermission: any = {
    can_manage_folder: false,
  };

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp1 => {
      this.currentUserPermission = resp1.data.permissions;
      this.adminService.getRestapiSettingsByKeys('ENABLE_SYS_ADMIN_VIEW_REPO').subscribe(resp => {
        this.enableViewRepo = resp.data.config_dict.ENABLE_SYS_ADMIN_VIEW_REPO;
      });
    });
  }

  deleteItem(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal('delete');
  }

  transferItem(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal('transfer');
  }

  handleOpenModal(typeModal: string) {
    if (typeModal === 'delete') {
      this.isOpenModal.delete = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.delete = false);
    } else if (typeModal === 'transfer') {
      this.isOpenModal.transfer = true;
      this.openModal('#transfer-folder-modal', () => this.isOpenModal.transfer = false);
    }
  }

  openModal(idModal: string, functionModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionModal).modal('show'));
  }

  onSubmitDeleteItem() {
    this.adminService.deleteAdminFolder(this.currentItem.id).subscribe(
      resps => {
        this.deleteReloadData.emit({ message_success: resps.message });
      }, error => {
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
        console.error('useradmin info owned folders delete folder: ', error);
      });
  }

  onSubmitTransferItem(dataTransfer: any) {
    this.adminService.postTransferOwnedLibs(dataTransfer, this.currentItem.id).subscribe(
      resps => {
        this.transferReloadData.emit({ message_success: resps.message });
      }, error => {
        this.transferFolderModalComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
        console.error('transfer owned folders: ', error);
      }
    );
  }
}
