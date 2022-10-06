import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, WikiService } from 'app/services';

@Component({
  selector: 'app-modal-rename-wiki',
  templateUrl: './modal-rename-wiki.component.html',
  styleUrls: ['./modal-rename-wiki.component.scss']
})
export class ModalRenameWikiComponent implements OnInit {

  selectedWiki: any = {};
  wikiNewName = '';
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private wikiService: WikiService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    this.wikiNewName = this.selectedWiki.name;
  }

  renameWiki() {
    if (this.wikiNewName.trim() === '' || this.wikiNewName === null || this.wikiNewName === undefined) {
      this.notify.showNotification('danger', this.translate.instant('WIKIS.WIKI_LIST.MESSAGES.WIKI_NAME_INVALID'));
      return false;
    }
    this.isProcessing = true;
    this.wikiService.postRenameWiki(this.selectedWiki.slug, this.wikiNewName).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
