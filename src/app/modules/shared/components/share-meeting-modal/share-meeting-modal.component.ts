import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-share-meeting-modal',
  templateUrl: './share-meeting-modal.component.html',
  styleUrls: ['./share-meeting-modal.component.scss']
})
export class ShareMeetingModalComponent implements OnInit {

  selectedMeetingRoomId = -1;
  isAdministration = false;
  currentTab = 'publicShare';

  constructor(
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  switchTab(tabName) {
    this.currentTab = tabName;
  }

}
