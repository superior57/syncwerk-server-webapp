import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router, Event, NavigationEnd, NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { CookieService } from 'ngx-cookie';


import { MeetingsService, NotificationService, NonAuthenticationService } from 'app/services';

import { ModalCreateNewMeetingComponent } from '../../components/modal-create-new-meeting/modal-create-new-meeting.component';
import { ModalDeleteMeetingComponent } from '../../components/modal-delete-meeting/modal-delete-meeting.component';
import { ModalStartJoinMeetingComponent } from '../../components/modal-start-join-meeting/modal-start-join-meeting.component';

import { ShareMeetingModalComponent } from '../../../shared/components/share-meeting-modal/share-meeting-modal.component';
import { ModalMeetingFileChooserComponent } from '../../components/modal-meeting-file-chooser/modal-meeting-file-chooser.component';

import * as _ from 'lodash';

declare const jQuery: any;

@Component({
  selector: 'app-meeting-list',
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.scss']
})
export class MeetingListComponent implements OnInit {

  enableMeetings: boolean = false;

  bsModalRef: BsModalRef;
  bsFileChooserModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;

  meetingListFromAPI = [];
  meetingListForDisplay = [];

  currentSearchQuery = '';

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  sortConfig = {
    column: 'room_name',
    mode: 'asc',
  };

  maxSize = 5;

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  isGetMeetingEnabled = true;
  isListView = false;
  rangeSizeGrid;

  // For slider
  rangeTransformScale: number;
  classRangeSize: string;
  rangeHeightPx: string;

  constructor(
    private router: Router,
    private meetingsService: MeetingsService,
    private notify: NotificationService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private nonAuthService: NonAuthenticationService,
    private cookieService: CookieService,
  ) {
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
  }

  ngOnInit() {
    // this.router.events.subscribe((event: Event) => {
    //   if(event instanceof NavigationStart) {
    //     this.unsubscribe();
    //   }
    // })
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.enableMeetings = resp.data.bbbMeetings;
      if (!this.enableMeetings) {
        this.router.navigate(['/error', '404']);
      }
    });
    this.isProcessing = true;
    this.getListMeeting();
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';
  }

  ngOnDestroy() {
    this.unsubscribe();
    setTimeout(() => {
      if (this.bsModalRef) {
        this.bsModalRef.hide();
      }
    }, 0)
  }

  getListMeeting() {
    this.meetingsService.getListMeeting().subscribe(resp => {
      this.meetingListFromAPI = resp.data.meeting_rooms;
      this.isProcessing = false;
      this.handlePagination();

    });
  }
  displayStatus(status: string) {
    switch (status) {
      case 'STOPPED':
        return this.translate.instant('MEETING.STATUS.STOPPED');
        break;
      case 'IN_PROGRESS':
        return this.translate.instant('MEETING.STATUS.IN_PROGRESS');
        break;
      default:
        return '';
    }
  }

  openStartMeetingModal(meeting, mode = "START") {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalStartJoinMeetingComponent, {
      class: 'modal-md',
      initialState: {
        meetingId: meeting.id,
        mode: mode,
      }
    });
  }

  openDeleteMeetingModal(meeting) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalDeleteMeetingComponent, {
      class: 'modal-md',
      initialState: {
        selectedMeeting: meeting,
      }
    });
  }

  editMeeting(meeting) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateNewMeetingComponent, {
      class: 'modal-lg create-edit-meeting-modal',
      initialState: {
        isEdit: true,
        meetingId: meeting.id,
        meetingRole: meeting.room_share_type === 'OWN' ? 'OWNER' : 'MODERATOR'
      }
    });
    this.bsModalRef.content.fileChooserEvent.subscribe(e => {
      this.openMeetingFileChooserModal();
    });
  }

  openMeetingFileChooserModal() {
    this.prepareModalSubscription();
    this.bsFileChooserModalRef = this.modalService.show(ModalMeetingFileChooserComponent, {
      class: 'modal-lg',
      initialState: {
        allowedExt: 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf,odt,ods,odp,odg,odc,odi,jpg,jpeg,png'
      },
      backdrop: true
    });
    this.bsFileChooserModalRef.content.submitFileEvent.subscribe(e => {
      e.files.forEach(file => {
        if (!this.bsModalRef.content.files.includes(file)) {
          this.bsModalRef.content.files.push(file);
        } else {
          // do nothing
        }
      });
    });
    this.focusOnCreateModal(false);
  }

  focusOnCreateModal(focus) {
    const createEditMeetingModal = jQuery('.create-edit-meeting-modal');
    if (focus) {
      createEditMeetingModal.css({
        opacity: '1',
        filter: 'none',
        '-webkit-filter': 'none'
      })
    } else {
      createEditMeetingModal.css({
        opacity: '0.5',
        filter: 'blur(5px)',
        '-webkit-filter': 'blur(5px)'
      })
    }
  }

  stopMeeting(meeting) {
    meeting.isStarting = false;
    meeting.isStopping = true;
    const meetingId = meeting.id;
    this.meetingsService.stopMeeting(meetingId).subscribe(resp => {
      this.getListMeeting();
      if (resp.hasOwnProperty('message')) {
        this.notify.showNotificationByMessageKey('success', resp.message);
      }
    }, err => {
      meeting.isStarting = false;
      meeting.isStopping = false;
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    });
  }

  getLink(meeting) {
    const share_token = meeting.share_token;
    const url = window.location.origin + '/share-link/m/' + share_token;
    return url;
  }

  copyLinks() {
    this.notify.showNotificationByMessageKey('success', 'Meeting share link is copied to the clipboard');
  }

  handlePagination() {
    // if (this.meetingListFromAPI) {
    //   this.meetingListForDisplay = Object.assign([], this.meetingListFromAPI);
    // }
    if (this.pagination.itemsPerPage <= 0) {
      this.meetingListForDisplay = Object.assign([], this.meetingListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.meetingListForDisplay = this.meetingListFromAPI.filter(ele => ele.room_name.toLowerCase().includes(this.currentSearchQuery) || ele.owner_id.toLowerCase().includes(this.currentSearchQuery)).slice(start, end);
      } else {
        this.meetingListForDisplay = this.meetingListFromAPI.slice(start, end);
      }
    }
  }

  onSearchFilterChange(data) {
    const currentTimeStamp = new Date();
    if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
      clearTimeout(this.searchTimeOut);
    }
    this.searchChangeTimeStamp = currentTimeStamp;
    this.searchTimeOut = setTimeout(() => {
      this.currentSearchQuery = data.target.value.toLowerCase();
      this.pagination.page = 1;
      this.getListMeeting();
    }, this.searchDelayInMilliseconds);
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.meetingListFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  pageChanged(data) {
    this.pagination = data;
    this.handlePagination();
  }

  openCreateNewMeetingModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateNewMeetingComponent, {
      class: 'modal-lg create-edit-meeting-modal'
    });
    this.bsModalRef.content.fileChooserEvent.subscribe(e => {
      this.openMeetingFileChooserModal();
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
        this.focusOnCreateModal(true);
        this.getListMeeting();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  openShareMeetingModal(meetingRoom) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ShareMeetingModalComponent, {
      class: 'modal-lg',
      initialState: {
        selectedMeetingRoomId: meetingRoom.id
      },
      backdrop: true
    });
  }

  triggerSort(columnName) {
    if (columnName !== this.sortConfig.column) {
      this.sortConfig.mode = 'asc';
    } else {
      if (this.sortConfig.mode === 'asc') {
        this.sortConfig.mode = 'desc';
      } else {
        this.sortConfig.mode = 'asc';
      }
    }
    this.sortConfig.column = columnName;
    this.handleSort();
  }

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'room_name':
          this.meetingListFromAPI = _.orderBy(this.meetingListFromAPI, ele => ele.room_name.toLowerCase(), order);
          break;
        case 'meeting_role':
          this.meetingListFromAPI = _.orderBy(this.meetingListFromAPI, ele => ele.meeting_role.toLowerCase(), order);
          break;
        case 'created_at':
          this.meetingListFromAPI = _.orderBy(this.meetingListFromAPI, ['created_at'], order);
          break;
        case 'owner_id':
          this.meetingListFromAPI = _.orderBy(this.meetingListFromAPI, ['owner_id'], order);
          break;
        case 'private_setting_name':
          this.meetingListFromAPI = _.orderBy(this.meetingListFromAPI, ['private_setting_name'], order);
          break;
        case 'private_setting_url':
          this.meetingListFromAPI = _.orderBy(this.meetingListFromAPI, ['private_setting_url'], order);
          break;
        case 'status':
          this.meetingListFromAPI = _.orderBy(this.meetingListFromAPI, ['status'], order);
          break;
      }
      this.handlePagination();
    }
  }

}
