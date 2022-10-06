import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, MeetingsService } from 'app/services';

@Component({
  selector: 'app-modal-delete-meeting',
  templateUrl: './modal-delete-meeting.component.html',
  styleUrls: ['./modal-delete-meeting.component.scss']
})
export class ModalDeleteMeetingComponent implements OnInit {

  selectedMeeting: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private meetingsService: MeetingsService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {

  }

  deleteMeeting() {
    this.isProcessing = true;
    this.meetingsService.removeMeeting(this.selectedMeeting.id).subscribe(resp => {
       this.notify.showNotificationByMessageKey('success', resp.message);
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

  closeModal() {
    this.bsModalRef.hide();
  }

}
