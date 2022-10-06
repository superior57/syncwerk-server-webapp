import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {
  ShareToUserFoldersAllComponent
} from '@modules/admin/components/share-to-user-folders-all/share-to-user-folders-all.component';
import {
  ShareToGroupFoldersAllComponent
} from '@modules/admin/components/share-to-group-folders-all/share-to-group-folders-all.component';

declare const jQuery: any;

@Component({
  selector: 'app-shares-folders-all-modal',
  templateUrl: './shares-folders-all-modal.component.html',
  styleUrls: ['./shares-folders-all-modal.component.scss']
})
export class SharesFoldersAllModalComponent implements OnInit {
  @Input() shareItem = {
    repoID: '',
    name: '',
    encrypted: false,
    owner: '',
  };
  currentContentTab = 0;
  params: any;
  showRequired = false;
  typeDelete: any;
  nameDelete = '';
  typeShare;

  @ViewChild(ShareToUserFoldersAllComponent) shareToUser: ShareToUserFoldersAllComponent;
  @ViewChild(ShareToGroupFoldersAllComponent) shareToGroup: ShareToGroupFoldersAllComponent;

  constructor() { }

  ngOnInit() {
    this.currentContentTab = 0;
  }

  changeTab(index: number) {
    if (this.currentContentTab === index) { return; }
    this.currentContentTab = index;
  }

  deleteFolderUser(data) {
    this.showRequired = true;
    this.typeShare = 'user';
    this.openModal('#modal-delete-remove', () => {
      this.showRequired = false;
      this.typeShare = '';
    });
    this.typeDelete = data;
    this.nameDelete = data.user_name;
  }

  deleteFolderGroup(data) {
    this.showRequired = true;
    this.typeShare = 'group';
    this.openModal('#modal-delete-remove', () => {
      this.showRequired = false;
      this.typeShare = '';
    });
    this.typeDelete = data;
    this.nameDelete = data.group_name;
  }

  onSubmitDeleteItem() {
    if (this.typeShare === 'user') {
      this.shareToUser.confirmDeleteUserShare(this.typeDelete);
    } else if (this.typeShare === 'group') {
      this.shareToGroup.confirmDeleteGroupShare(this.typeDelete);
    }
    jQuery('#modal-delete-remove').modal('hide');
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => {
      jQuery(idModal)
        .on('hidden.bs.modal', functionCloseModal)
        .modal('show');
    });
  }
}
