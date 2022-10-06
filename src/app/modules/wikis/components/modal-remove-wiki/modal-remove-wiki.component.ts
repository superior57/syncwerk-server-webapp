import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, WikiService } from 'app/services';

@Component({
  selector: 'app-modal-remove-wiki',
  templateUrl: './modal-remove-wiki.component.html',
  styleUrls: ['./modal-remove-wiki.component.scss']
})
export class ModalRemoveWikiComponent implements OnInit {

  selectedWiki: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private wikiService: WikiService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  removeWiki() {
    this.isProcessing = true;
    this.wikiService.deleteWiki(this.selectedWiki.slug).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
