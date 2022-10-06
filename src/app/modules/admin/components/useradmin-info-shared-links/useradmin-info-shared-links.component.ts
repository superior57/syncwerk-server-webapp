import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AdminService, NotificationService, AuthenticationService } from 'app/services';
import { Router } from '@angular/router';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';

declare const jQuery: any;

@Component({
  selector: 'app-useradmin-info-shared-links',
  templateUrl: './useradmin-info-shared-links.component.html',
  styleUrls: ['./useradmin-info-shared-links.component.scss']
})
export class UseradminInfoSharedLinksComponent implements OnInit {

  @Input() listSharedLinks = [];
  @Output() removeReloadData = new EventEmitter;

  @ViewChild(ModalDeleteRemoveComponent) modalDeleteRemoveComponent;

  currentItem: any;
  isOpenModal = {
    remove: false,
  };
  params: any;

  enableViewRepo = false;

  currentUserPermission: any = {
    can_manage_folder: false,
  };

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private router: Router,
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

  removeItem(itemData: any) {
    this.currentItem = itemData;
    this.handleOpenModal('remove');
  }

  handleOpenModal(typeModal: string) {
    if (typeModal === 'remove') {
      this.isOpenModal.remove = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.remove = false);
    }
  }

  openModal(idModal: string, functionModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionModal).modal('show'));
  }

  onSubmitRemoveItem() {
    const typeShareLink = this.currentItem.is_download ? 'download-link' : this.currentItem.is_upload ? 'upload-link' : '';
    if (typeShareLink === '') { return; }
    this.adminService.deleteSharedLinksRemoveLink(this.currentItem.token, typeShareLink).subscribe(
      resps => {
        this.removeReloadData.emit({ message_success: resps.message });
      }, error => {
        console.error('shared links remove download link: ', error);
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('success', JSON.parse(error._body).message);
      });
  }

  setErrorImg(index) {
    this.listSharedLinks[index].imgError = 1;
  }


  browseShareLink(item) {
    console.log(item);
    if (item.is_dir_share_link || item.is_upload) {
      let path = item.path.split('/');
      path = path.filter(ele => ele !== '');
      console.log(path);
      path.unshift(item.repo_id);
      path.unshift('folders');
      path.unshift('/admin');
      this.router.navigate(path);
      // console.log(item.path.split('/'));
    }
  }

  visitLink(link) {
    if (link.is_upload) {
      window.open(`${window.location.origin}/share-link/u/d/${link.token}`, '_blank');
    } else {
      window.open(`${window.location.origin}/share-link/${link.s_type}/${link.token}`, '_blank');
    }
  }
}
