
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AdminService, NotificationService, AuthenticationService } from 'app/services';

import { AdminUnshareGroupFolderComponent } from '../../components/admin-unshare-group-folder/admin-unshare-group-folder.component';

@Component({
  selector: 'app-group-folders',
  templateUrl: './group-folders.component.html',
  styleUrls: ['./group-folders.component.scss']
})
export class GroupFoldersComponent implements OnInit {

  bsModalRef: BsModalRef;

  isProcessing = false;
  settings: any = {};

  listFolderFromAPI = [];
  listFolderForDisplayed = [];

  currentGroupInfo: any = {};

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  maxSize = 5;

  subscriptions: Subscription[] = [];

  currentSearchQuery = '';

  currentUserPermission: any = {
    can_manage_folder: false,
  };


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notify: NotificationService,
    private adminService: AdminService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {

    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;
      this.getSettings();
      this.activatedRoute.params.subscribe(params => {
        console.log(params);
        this.getGroupFolders(params.groupId);
      });
    });
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  getSettings() {
    this.adminService.getRestapiSettingsByKeys('ENABLE_SYS_ADMIN_VIEW_REPO').subscribe(resp => {
      this.settings = resp.data.config_dict;
    });
  }

  getGroupFolders(groupId) {
    this.isProcessing = true;
    this.adminService.getGroupFolderList(groupId).subscribe(resp => {
      this.listFolderFromAPI = resp.data.folders;
      this.currentGroupInfo.groupName = resp.data.group_name;
      this.currentGroupInfo.groupId = resp.data.group_id;
      this.handlePagination();
      this.isProcessing = false;
    });
  }

  handlePagination() {
    const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
    const end = start + this.pagination.itemsPerPage;
    // Filter result
    if (this.currentSearchQuery !== '') {
      this.listFolderFromAPI = this.listFolderFromAPI.filter(ele => ele.name.includes(this.currentSearchQuery));
    }
    this.listFolderForDisplayed = this.listFolderFromAPI.slice(start, end);
  }

  viewFolders(folder) {
    console.log(folder);
    this.router.navigate(['/admin', 'folders', folder.repo_id]);
  }

  openUnshareModal(folder) {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.getGroupFolders(this.currentGroupInfo.groupId);
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.bsModalRef = this.modalService.show(AdminUnshareGroupFolderComponent, {
      class: 'modal-md',
      initialState: {
        folderInfo: folder,
      },
    });
  }

  onSearchFilterChange(data) {
    console.log(data);
    // Keycode 13 is the enter key
    if (data.keyCode === 13) {
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.getGroupFolders(this.currentGroupInfo.groupId);
    }
  }

  pageChanged(data) {
    console.log(data);
    this.pagination = data;
    this.getGroupFolders(this.currentGroupInfo.groupId);
  }

  onPerPageChanged(data) {
    console.log(data);
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.listFolderFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

}
