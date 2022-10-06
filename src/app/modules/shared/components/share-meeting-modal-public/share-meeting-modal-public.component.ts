import { Component, OnInit, Input } from '@angular/core';

import { NotificationService, MeetingsService, AdminService } from 'app/services';

@Component({
  selector: 'app-share-meeting-modal-public',
  templateUrl: './share-meeting-modal-public.component.html',
  styleUrls: ['./share-meeting-modal-public.component.scss']
})
export class ShareMeetingModalPublicComponent implements OnInit {

  @Input() meetingRoomId = -1;
  @Input() isAdministration = false;

  isLoading = false
  modalService = null;

  selectedMeetingInfo: any = {};

  constructor(
    private notify: NotificationService,
    private meetingsService: MeetingsService,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.modalService = this.meetingsService;
    if (this.isAdministration == true) {
      this.modalService = this.adminService;
    }

    this.getMeetingRoomInfo();
  }

  getMeetingRoomInfo() {
    
    this.modalService.getMeetingById(this.meetingRoomId).subscribe(resp => {
      this.selectedMeetingInfo = resp.data
      if (this.selectedMeetingInfo.public_share_token) {
        this.selectedMeetingInfo.public_link = `${window.location.origin}/share-link/m/${this.selectedMeetingInfo.public_share_token}`
      }
      this.isLoading = false;
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.isLoading = false;
    });
  }

  submitCopy() {
    this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }

  createLink() {
    this.isLoading = true;
    this.modalService.postCreateMeetingRoomPublicLink(this.meetingRoomId).subscribe(resp => {
      this.notify.showNotificationByMessageKey('success', resp.message);
      this.getMeetingRoomInfo();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.isLoading = false;
    });
  }

  deleteLink() {
    this.isLoading = true;
    this.modalService.deleteRemoveMeetingRoomPublicLink(this.meetingRoomId).subscribe(resp => {
      this.notify.showNotificationByMessageKey('success', resp.message);
      this.getMeetingRoomInfo();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.isLoading = false;
    });
  }

}
