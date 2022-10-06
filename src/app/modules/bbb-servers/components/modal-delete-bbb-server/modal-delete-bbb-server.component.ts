import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, BBBService } from 'app/services';

@Component({
  selector: 'app-modal-delete-bbb-server',
  templateUrl: './modal-delete-bbb-server.component.html',
  styleUrls: ['./modal-delete-bbb-server.component.scss']
})
export class ModalDeleteBbbServerComponent implements OnInit {

  selectedBBBServer: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private bbbService: BBBService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  deleteBBBServer() {
    this.isProcessing = true;
    this.bbbService.deleteBBBServer(this.selectedBBBServer.id).subscribe(resp => {
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
