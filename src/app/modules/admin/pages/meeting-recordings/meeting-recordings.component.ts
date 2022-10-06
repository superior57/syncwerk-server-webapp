import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { CookieService } from 'ngx-cookie';


import { AdminService, NotificationService, NonAuthenticationService } from 'app/services';
import { ModalDeleteRecordingComponent } from '../../components/modal-delete-recording/modal-delete-recording.component';


import * as _ from 'lodash';

@Component({
  selector: 'app-meeting-recordings',
  templateUrl: './meeting-recordings.component.html',
  styleUrls: ['./meeting-recordings.component.scss']
})

export class MeetingRecordingComponent implements OnInit {
  enableMeetings: boolean = false;
  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;
  currentSearchQuery = '';
  recordingListFromAPI = [];
  recordingListForDisplay = [];
  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  maxSize = 5;
  sortConfig = {
    column: '',
    mode: '',
  };
  meetingId: number;
  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();
  rangeSizeGrid;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notify: NotificationService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private nonAuthService: NonAuthenticationService,
    private cookieService: CookieService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.meetingId = params.meetingId;
    });
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
  }


  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.enableMeetings = resp.data.bbbMeetings;
      if (!this.enableMeetings) {
        this.router.navigate(['/error', '404']);
      }
    });
    this.isProcessing = true;
    this.getListRecording();
  }

  getListRecording() {
    this.adminService.getListRecording(this.meetingId).subscribe(resp => {
      this.isProcessing = false;
      console.log(resp);
      const data = resp.data;
      let recordings = data.recordings;
      if (!recordings) {
        return false;
      }

      this.recordingListFromAPI = recordings;
      // handle thumbnail image
      for (const recording of this.recordingListFromAPI) {
        if (recording.playback_info.format.type !== 'presentation') {
          recording.thumbnail = null;
        } else {
          try {
            recording.thumbnail = recording.playback_info.format.preview.images.image[0]
          } catch (error) {
            recording.thumbnail = null
          }
        }
      }
      this.handlePagination();

    });
  }
  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.recordingListForDisplay = Object.assign([], this.recordingListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.recordingListForDisplay = this.recordingListFromAPI.filter(ele => ele.room_name.toLowerCase().includes(this.currentSearchQuery)).slice(start, end);
      } else {
        this.recordingListForDisplay = this.recordingListFromAPI.slice(start, end);
      }
    }
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.recordingListFromAPI.length;
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

  onSearchFilterChange(data) {
    const currentTimeStamp = new Date();
    if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
      clearTimeout(this.searchTimeOut);
    }
    this.searchChangeTimeStamp = currentTimeStamp;
    this.searchTimeOut = setTimeout(() => {
      this.currentSearchQuery = data.target.value.toLowerCase();
      this.pagination.page = 1;
      this.getListRecording();
    }, this.searchDelayInMilliseconds);
  }

  openDeleteRecordingModal(recording) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalDeleteRecordingComponent, {
      class: 'modal-md',
      initialState: {
        selectedRecording: recording,
      }
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
        this.getListRecording();
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

  publishRecording(recording: any, isPublish: string) {
    if (isPublish == 'yes') {
      recording.isPublishing = true;
      recording.isUnpublishing = false;
    } else {
      recording.isPublishing = false;
      recording.isUnpublishing = true;
    }
    this.adminService.publishRecording(recording.meeting_id, recording.record_id, isPublish).subscribe(resp => {
      this.getListRecording();

    });
  }


}
