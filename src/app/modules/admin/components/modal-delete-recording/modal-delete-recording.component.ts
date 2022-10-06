import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService } from 'app/services';

@Component({
  selector: 'app-modal-delete-recording',
  templateUrl: './modal-delete-recording.component.html',
  styleUrls: ['./modal-delete-recording.component.scss']
})
export class ModalDeleteRecordingComponent implements OnInit {

  selectedRecording: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {

  }

  deleteRecording() {
    this.isProcessing = true;
    this.adminService.deleteRecording(this.selectedRecording.meeting_id, this.selectedRecording.record_id).subscribe(resp => {
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
