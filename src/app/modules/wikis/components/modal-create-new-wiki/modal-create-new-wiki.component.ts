import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, WikiService } from 'app/services';

@Component({
  selector: 'app-modal-create-new-wiki',
  templateUrl: './modal-create-new-wiki.component.html',
  styleUrls: ['./modal-create-new-wiki.component.scss']
})
export class ModalCreateNewWikiComponent implements OnInit {

  wikiName = '';
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private wikiService: WikiService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  addWiki() {
    if (this.wikiName.trim() === '' || this.wikiName === null || this.wikiName === undefined) {
      this.notify.showNotification('danger', this.translate.instant('WIKIS.WIKI_LIST.MESSAGES.WIKI_NAME_INVALID'));
      return false;
    }
    this.isProcessing = true;
    this.wikiService.postCreateNewWiki(this.wikiName).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
