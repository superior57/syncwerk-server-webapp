import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, FilesService } from 'app/services';

@Component({
  selector: 'app-modal-remove-wiki-page',
  templateUrl: './modal-remove-wiki-page.component.html',
  styleUrls: ['./modal-remove-wiki-page.component.scss']
})
export class ModalRemoveWikiPageComponent implements OnInit {

  selectedPage: any = {};
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private fileService: FilesService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {

  }

  removeWikiPage() {
    this.isProcessing = true;
    this.fileService.deleteEntry('file', this.selectedPage.repo_id, `${this.selectedPage.file_path}`).subscribe(resp => {
    // this.fileService.deleteFolder(this.selectedPage.repo_id, `/file/?p=${this.selectedPage.file_path}`).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('WIKIS.WIKI_PAGES.MESSAGES.WIKI_PAGE_REMOVE_SUCCESSFULLY'));
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
