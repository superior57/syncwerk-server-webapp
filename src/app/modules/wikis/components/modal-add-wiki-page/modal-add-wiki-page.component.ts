import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, WikiService } from 'app/services';

@Component({
  selector: 'app-modal-add-wiki-page',
  templateUrl: './modal-add-wiki-page.component.html',
  styleUrls: ['./modal-add-wiki-page.component.scss']
})
export class ModalAddWikiPageComponent implements OnInit {

  pageName = '';
  isProcessing = false;
  currentWiki: any = {};

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private wikiService: WikiService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  addWikiPage() {
    if (this.pageName.trim() === '' || this.pageName === null || this.pageName === undefined || !this.pageName.match(/^[a-zA-Z0-9_ .-]*$/)) {
      this.notify.showNotification('danger', this.translate.instant('WIKIS.WIKI_PAGES.MESSAGES.WIKI_PAGE_NAME_INVALID'));
      return false;
    }
    this.isProcessing = true;
    this.wikiService.postCreateNewWikiPage(this.currentWiki.slug, this.pageName).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('WIKIS.WIKI_PAGES.MESSAGES.WIKI_PAGE_CREATED_SUCCESSFULLY'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
