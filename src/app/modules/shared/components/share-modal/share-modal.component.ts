import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { Router } from '@angular/router';

import { Action, Type } from '@enum/index.enum';
import { FoldersModel } from 'app/Models/Folder.model';
import { AuthenticationService, MessageService, FilesService, AdminService, NonAuthenticationService } from '@services/index';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import { ShareToUserComponent } from '@shared/components/share-to-user/share-to-user.component';
import { ShareToGroupComponent } from '@shared/components/share-to-group/share-to-group.component';
import { ShareUploadLinkComponent } from '@shared/components/share-upload-link/share-upload-link.component';
import { ShareDownloadLinkComponent } from '@shared/components/share-download-link/share-download-link.component';

declare const jQuery: any;

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss']
})
export class ShareModalComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  @Input() shareItem = {
    repoID: '',
    path: '',
    type: '',
    name: '',
    encrypted: false,
    permission: '',
    owner: '',
  };
  currentContentTab = 0;
  shareLink;
  uploadLink;
  encrypted = true;
  id = '';
  fileName = '';
  isDownloadLink = true;
  isUploadLink = true;
  isShareUser = true;
  isShareGroup = true;
  isShareAll = false;
  path = '/';
  currentLoginUser;
  params: any;
  showRequired = false;
  typeDelete: any;
  typeShare;
  nameDelete = '';

  currentUserPermission: any = {
    can_generate_share_link: false,
    can_generate_upload_link: false,
  };

  isEnabledInternalShare = false;
  isEnabledPubliclShare = false;

  @ViewChild(ShareUploadLinkComponent) deleteUploadLink: ShareUploadLinkComponent;
  @ViewChild(ShareDownloadLinkComponent) deleteDownloadLink: ShareDownloadLinkComponent;
  @ViewChild(ShareToUserComponent) deleteShareUser: ShareToUserComponent;
  @ViewChild(ShareToGroupComponent) deleteShareGroup: ShareToGroupComponent;

  constructor(
    private fileService: FilesService,
    private messageService: MessageService,
    private authService: AuthenticationService,
    private adminService: AdminService,
    private nonAuthSerice: NonAuthenticationService,
    private cookieService: CookieService,
    private router: Router,
  ) {
    this.nonAuthSerice.getAvailableFeatures().subscribe(resp => {
      this.isEnabledInternalShare = resp.data.internal_share;
      this.isEnabledPubliclShare = resp.data.public_share;
    });
   }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp => {
      console.log(resp);
      this.currentUserPermission = resp.data.permissions;
      this.subscribe();
      this.initData();
    });

  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Share_Folder_Modal, (payload) => {
      switch (payload.action) {
        case Action.Remove_Share_Link: this.shareLink = ''; break;
        case Action.Generate_Download_Link: this.shareLink = payload.data; break;
        case Action.Generate_Upload_Link: this.uploadLink = payload.data; break;
        case Action.Remove_Upload_Link: this.uploadLink = ''; break;
        default: break;
      }
    });
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  initData() {
    if (this.shareItem.repoID !== '' && this.shareItem.path !== '') {
      this.getInitData(this.shareItem);
      this.checkRolePermission();
    }
  }

  getInitData(shareItem) {
    this.shareLink = '';
    this.uploadLink = '';
    this.send('', this.shareLink, Type.Download_Link);
    this.send('', this.uploadLink, Type.Upload_Link);
    this.getLinkFileShare(shareItem.repoID, shareItem.path);
    // upload links not available in file share
    if (shareItem.type === 'repo' || shareItem.type === 'dir' || shareItem.type === 'upload-link') {
      this.getUploadLinkShare(shareItem.repoID, shareItem.path);
    }
  }

  getLinkFileShare(folder_id: string, path: string) {
    this.fileService.getLinkFileShare(folder_id, path)
      .subscribe(resp => {
        const shareLinks: any[] = resp.data;
        if (shareLinks.length > 0) {
          this.shareLink = resp.data[0];
          this.shareLink.link = `${window.location.origin}/${this.shareLink.link}`;
          this.send(folder_id, this.shareLink, Type.Download_Link);
        }
      }, error => console.error(error));
  }

  getUploadLinkShare(folder_id: string, path: string) {
    this.fileService.getLinkUpload(folder_id, path)
      .subscribe(resp => {
        const uploadLinks: any[] = resp.data;
        if (uploadLinks.length > 0) {
          this.uploadLink = resp.data[0];
          this.uploadLink.link = `${window.location.origin}/${this.uploadLink.link}`;
          this.send(folder_id, this.uploadLink, Type.Upload_Link);
        }
      }, error => console.error(error));
  }

  checkRolePermission() {
    this.authService.userInfo().subscribe(resps => {
      this.currentLoginUser = resps.data;
      this.handleShareMenu(this.shareItem);
    });
  }

  handleShareMenu(shareItem) {
    this.nonAuthSerice.getRestapiSettingsByKeys('ENABLE_GLOBAL_SHARES').subscribe(resp => {
      const isOwner = this.shareItem.owner === this.currentLoginUser.email;
      this.isShareAll = false;
      if (shareItem.type === 'repo') {
        this.isShareAll = resp.data.config_dict.ENABLE_GLOBAL_SHARES;
        if (shareItem.encrypted === true) {
          this.isDownloadLink = false;
          this.isUploadLink = false;
          this.isShareUser = isOwner;
          this.isShareGroup = isOwner;
          this.currentContentTab = 2;
        } else if (shareItem.permission === 'r') {
          this.isDownloadLink = true;
          this.isUploadLink = false;
          this.isShareUser = false;
          this.isShareGroup = false;
          this.currentContentTab = 0;
        } else {
          this.isDownloadLink = true;
          this.isUploadLink = true;
          this.isShareUser = isOwner;
          this.isShareGroup = isOwner;
          this.currentContentTab = 0;
        }
      } else if (shareItem.type === 'dir') {
        if (shareItem.permission === 'r') {
          this.isDownloadLink = true;
          this.isUploadLink = false;
          this.isShareUser = false;
          this.isShareGroup = false;
          this.currentContentTab = 0;
        } else {
          this.isDownloadLink = true;
          this.isUploadLink = true;
          this.isShareUser = isOwner;
          this.isShareGroup = isOwner;
          this.currentContentTab = 0;
        }
      } else if (shareItem.type === 'download-link') {
        this.isDownloadLink = true;
        this.isUploadLink = false;
        this.isShareUser = false;
        this.isShareGroup = false;
        this.currentContentTab = 0;
      } else if (shareItem.type === 'upload-link') {
        this.isDownloadLink = false;
        this.isUploadLink = true;
        this.isShareUser = false;
        this.isShareGroup = false;
        this.currentContentTab = 1;
      } else {
        this.isDownloadLink = true;
        this.isUploadLink = false;
        this.isShareUser = false;
        this.isShareGroup = false;
        this.currentContentTab = 0;
      }
      // handle user permission
      if (this.currentUserPermission.can_generate_upload_link === false) {
        this.isUploadLink = false;
        this.currentContentTab = 2;
      }
      if (this.currentUserPermission.can_generate_share_link === false) {
        this.isDownloadLink = false;
        this.currentContentTab = 2;
      }
    });


  }

  changeTab(index: number) {
    if (this.currentContentTab === index) { return; }
    this.currentContentTab = index;
    console.log(`ss`, this.shareItem);
    switch (index) {
      case 0: this.send(this.id, this.shareLink, Type.Download_Link); break;
      case 1: this.send(this.id, this.uploadLink, Type.Upload_Link); break;
      case 2: this.send(this.id, '', Type.Share_To_User); break;
      case 3: this.send(this.id, '', Type.Share_To_Group); break;
      default: break;
    }
  }

  send(folderId: string, data: any, type: any) {
    const payload = {
      type: type,
      folderId: folderId,
      data: data
    };
    this.messageService.broadcast(type, payload);
  }

  deleteUserShare(event) {
    this.showRequired = true;
    this.typeShare = 'user';
    this.openModal('#modal-delete-remove', () => {
      this.showRequired = false;
      this.typeShare = '';
    });
    this.typeDelete = event;
    this.nameDelete = this.typeDelete.dataItem.user_info.nickname;
  }

  deleteGroupShare(event) {
    this.showRequired = true;
    this.typeShare = 'group';
    this.openModal('#modal-delete-remove', () => {
      this.showRequired = false;
      this.typeShare = '';
    });
    this.typeDelete = event;
    this.nameDelete = this.typeDelete.dataItem.group_info.name;
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => {
      jQuery(idModal)
        .on('hidden.bs.modal', functionCloseModal)
        .modal('show');
    });
  }

  onSubmitDeleteItem() {
    if (this.typeShare === 'user') {
      // this.deleteShareUser.deleteUserShared(this.typeDelete);
    } else if (this.typeShare === 'group') {
      // this.deleteShareGroup.deleteGroupShared(this.typeDelete);
    } else if (this.typeShare === 'download') {
      this.deleteDownloadLink.deleteLink();
    } else if (this.typeShare === 'upload') {
      this.deleteUploadLink.deleteLink();
    }
    jQuery('#modal-delete-remove').modal('hide');
  }

  removeDownloadLink() {
    this.showRequired = true;
    this.typeShare = 'download';
    this.openModal('#modal-delete-remove', () => {
      this.showRequired = false;
      this.typeShare = '';
    });
    this.nameDelete = '';
  }

  removeUploadLink() {
    this.showRequired = true;
    this.typeShare = 'upload';
    this.openModal('#modal-delete-remove', () => {
      this.showRequired = false;
      this.typeShare = '';
    });
    this.nameDelete = '';
  }
}
