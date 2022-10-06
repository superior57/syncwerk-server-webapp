
import {combineLatest as observableCombineLatest,  Observable ,  Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { NotificationService, AdminService, AuthenticationService, TitleService } from 'app/services';

import { GroupRemoveMemberModalComponent } from '../../components/group-remove-member-modal/group-remove-member-modal.component';
import { GroupAddMemberModalComponent } from '../../components/group-add-member-modal/group-add-member-modal.component';
import { BBBSettingModalComponent } from '@shared/components/bbb-setting-modal/bbb-setting-modal.component';

@Component({
  selector: 'app-group-management',
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.scss']
})
export class GroupManagementComponent implements OnInit {

  bsModalRef: BsModalRef;

  roleOptions = [];
  isProcessing = false;

  currentGroupInfo: any = {};
  currentLoginUser: any = {};

  groupMembersFromAPI = [];
  groupMembersForDisplay = [];

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  maxSize = 5;

  subscriptions: Subscription[] = [];

  currentSearchQuery = '';
  currentUserPermission: any = {
    can_manage_group: false,
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private authService: AuthenticationService,
    private notify: NotificationService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.getCurrentLoginUser();
    this.activatedRoute.params.subscribe(params => {
      this.currentGroupInfo.groupId = params.groupId;
      this.isProcessing = true;
      this.getGroupMembers(this.currentGroupInfo.groupId);
    });
    this.initSelectData();
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  initSelectData() {
    this.roleOptions = [
      {
        value: true,
        text: this.translate.instant('GROUP_MANAGEMENT.ROLE_ADMIN')
      },
      {
        value: false,
        text: this.translate.instant('GROUP_MANAGEMENT.ROLE_MEMBER')
      }
    ];
  }

  getCurrentLoginUser() {
    this.authService.userInfo().subscribe(resp => {
      this.currentLoginUser = resp.data;
      this.currentUserPermission = resp.data.permissions;
    });
  }

  getGroupMembers(groupId) {
    this.adminService.getGroupMemebers(groupId).subscribe(resp => {
      this.currentGroupInfo.groupName = resp.data.group_name;
      this.groupMembersFromAPI = resp.data.members;
      this.handlePagination();
      this.isProcessing = false;
      this.titleService.setTitle(
        [
          {
            str:this.currentGroupInfo.groupName,
            translate: false
          },
          {
            str: "ADMIN.GROUPS.TITLE.GROUP_MANAGEMENT",
            translate: true
          }
        ]
      )
    });
  }

  handlePagination() {
    const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
    const end = start + this.pagination.itemsPerPage;

    if (this.currentSearchQuery !== '') {
      this.groupMembersFromAPI = this.groupMembersFromAPI.filter(ele => ele.email.includes(this.currentSearchQuery) || ele.name.includes(this.currentSearchQuery));
    }

    this.groupMembersForDisplay = this.groupMembersFromAPI.slice(start, end);
  }

  changeGroupMemberRole(member, isAdmin) {
    if (member.is_admin === isAdmin) {
      return;
    }
    this.adminService.putChangeMemberRole(member.group_id, member.email, isAdmin).subscribe(resp => {
      this.getGroupMembers(member.group_id);
      this.notify.showNotification('success', this.translate.instant('ADMIN.GROUPS.MESSAGES.CHANGE_GROUP_MEMBER_ROLE_SUCCESS'));
    });
  }

  prepareModalSubscription() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.getGroupMembers(this.currentGroupInfo.groupId);
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  openRemoveMemberModal(member) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(GroupRemoveMemberModalComponent, {
      class: 'modal-md',
      initialState: {
        memberInfo: member,
      },
    });
  }

  openGroupAddMemberModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(GroupAddMemberModalComponent, {
      class: 'modal-md',
      initialState: {
        groupInfo: this.currentGroupInfo,
      },
    });
  }

  pageChanged(data) {
    this.pagination = data;
    this.getGroupMembers(this.currentGroupInfo.groupId);
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.groupMembersFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  onSearchFilterChange(data) {
    console.log(data);
    // Keycode 13 is the enter key
    if (data.keyCode === 13) {
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.getGroupMembers(this.currentGroupInfo.groupId);
    }
  }
}
