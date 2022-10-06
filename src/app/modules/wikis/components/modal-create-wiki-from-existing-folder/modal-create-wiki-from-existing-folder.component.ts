import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, WikiService, FilesService } from 'app/services';

@Component({
  selector: 'app-modal-create-wiki-from-existing-folder',
  templateUrl: './modal-create-wiki-from-existing-folder.component.html',
  styleUrls: ['./modal-create-wiki-from-existing-folder.component.scss']
})
export class ModalCreateWikiFromExistingFolderComponent implements OnInit {

  listFolderToChoose = [];
  selectedFolder: any = null;
  processes = {
    isLoadingFolder: false,
    isProceesingCreateWiki: false,
  };

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private wikiService: WikiService,
    private fileService: FilesService,
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
    this.processes.isLoadingFolder = true;
    this.getMyFolders();
  }

  getMyFolders() {
    this.fileService.getRepo('mine').subscribe(resp => {
      this.listFolderToChoose = resp.data.filter(folder => !folder.encrypted);
      this.processes.isLoadingFolder = false;
    });
  }

  chooseFolder(folder) {
    this.selectedFolder = folder;
  }

  createWikiFromFolder() {
    if (!this.selectedFolder) {
      this.notify.showNotification('danger', this.translate.instant('WIKIS.WIKI_LIST.MESSAGES.NEED_TO_SELECT_A_FOLDER'));
      return false;
    }
    this.processes.isProceesingCreateWiki = true;
    this.wikiService.postCreateNewWikiFromExistingFolder(this.selectedFolder.id).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.bsModalRef.hide();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

}
