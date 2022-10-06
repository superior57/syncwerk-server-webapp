import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CookieService } from 'ngx-cookie';

import { MeetingsService, NotificationService, NonAuthenticationService } from 'app/services';

@Component({
  selector: 'app-modal-start-join-meeting',
  templateUrl: './modal-start-join-meeting.component.html',
  styleUrls: ['./modal-start-join-meeting.component.scss']
})
export class ModalStartJoinMeetingComponent implements OnInit {

  meetingId = 0;
  mode = '';
  meetingInfo: any = {};
  meetingPassword = '';

  is_starting_joining_meeting = false;
  show_password_field = false;

  constructor(
    private meetingsService: MeetingsService,
    private notify: NotificationService,
    public bsModalRef: BsModalRef,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.meetingsService.getMeetingById(this.meetingId).subscribe(resp => {
      this.meetingInfo = resp.data;
      this.startJoinMeeting();

/**
      if (this.meetingInfo.room_share_type === 'OWN') {
        // Current user is the owner. Allow to freely start / stop the meeting
        this.startJoinMeeting();
      } else if (this.meetingInfo.require_meeting_password === false) {
        // no password needed. Allow to start / join meeting too
        this.startJoinMeeting();
      } else {
        // password required. Display the password field
        this.show_password_field = true;
      }

*/
    }, error => {

    })
  }

  startJoinMeeting() {
    // TODO: Continue here tomorrow. Add a cookie named 'end_meeting_redirect_location' before redirect user to the meeting"
    // value should be the current link on the browser
    this.is_starting_joining_meeting = true;
    this.show_password_field = false;
    console.log(this.meetingPassword);
    this.meetingsService.startMeeting(this.meetingInfo.id, this.meetingPassword).subscribe(resp => {
      const data = resp.data;
      const join_url = data.join_url;
      this.cookieService.put('end_meeting_redirect_location', window.location.href);
      window.open(join_url, '_self');
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
      this.closeModal();
    })
  }

  closeModal() {
    this.bsModalRef.hide();
  }

}
