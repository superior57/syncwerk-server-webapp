import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, FilesService } from 'app/services';

@Component({
  selector: 'app-modal-rename-wiki-page',
  templateUrl: './modal-rename-wiki-page.component.html',
  styleUrls: ['./modal-rename-wiki-page.component.scss']
})
export class ModalRenameWikiPageComponent implements OnInit {

  selectedWiki: any = {};
  selectedPage: any = {};
  isProcessing = false;
  newName = '';

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private fileService: FilesService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    this.newName = this.selectedPage.name;
  }

  renamePage() {
    if (this.newName.trim() === '' || this.newName === null || this.newName === undefined || !this.newName.match(/^[a-zA-Z0-9_ .-]*$/)) {
      this.notify.showNotification('danger', this.translate.instant('WIKIS.WIKI_PAGES.MESSAGES.WIKI_PAGE_NAME_INVALID'));
      return false;
    }
    this.isProcessing = true;
    this.fileService.renameFileFolder(this.selectedPage.repo_id, this.selectedPage.file_path, this.newName + '.md', 'file').subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('WIKIS.WIKI_PAGES.MESSAGES.WIKI_PAGE_RENAMED_SUCCESSFULLY'));
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }



}
