
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { TranslateService } from '@ngx-translate/core';

import { NotificationService, WikiService, FilesService, TitleService } from 'app/services';

import { ModalRenameWikiPageComponent } from '../../components/modal-rename-wiki-page/modal-rename-wiki-page.component';
import { ModalRemoveWikiPageComponent } from '../../components/modal-remove-wiki-page/modal-remove-wiki-page.component';
import { ModalAddWikiPageComponent } from '../../components/modal-add-wiki-page/modal-add-wiki-page.component';

@Component({
  selector: 'app-wiki-pages',
  templateUrl: './wiki-pages.component.html',
  styleUrls: ['./wiki-pages.component.scss']
})
export class WikiPagesComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  selectedWikiSlug = '';
  wikiInfo: any = {};
  selectedPage: any = null;
  pageInfo: any = {};
  editMode = false;
  fileEditHeadID = '';

  processes = {
    gettingWikiInfo: false,
    gettingPageContent: false,
  };

  markdownEditorConfig = {
    autofocus: true,
    forceSync: true,
    toolbar: ['bold', 'italic', '|'
      , 'heading-1', 'heading-2', 'heading-3', '|'
      , 'unordered-list', 'ordered-list', 'horizontal-rule', '|'
      , 'link', 'image', 'table', '|'
      , 'preview', 'side-by-side', 'fullscreen']
  };

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private wikiService: WikiService,
    private fileService: FilesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.processes.gettingWikiInfo = true;
      this.selectedWikiSlug = params.slug;
      this.getWikiPages();
    });
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  prepareModalSubscription() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.selectedPage = null;
        this.getWikiPages();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  getWikiPages() {
    this.wikiService.getWikiInfo(this.selectedWikiSlug).subscribe(resp => {
      this.wikiInfo = resp.data;
      console.log(this.wikiInfo);
      this.processes.gettingWikiInfo = false;
      this.titleService.setTitle(
        [
          {
            str: this.wikiInfo.name,
            translate: false
          },
          {
            str: 'WIKIS.WIKI_PAGES.TITLE',
            translate: true
          }
        ]);
    });
  }

  previewPage(page) {
    this.editMode = false;
    this.selectedPage = page;
    this.fileService.getPreviewFileData(page.repo_id, page.file_path).subscribe(resp => {
      this.pageInfo = resp.data;
      this.selectedPage.updated_at = this.pageInfo.current_commit.time;
    });
  }

  enableEditMode() {
    this.fileService.getFileEditHead(this.pageInfo.repo_id, this.pageInfo.path).subscribe(resp => {
      this.fileEditHeadID = resp.data.head_id;
      this.editMode = true;
    });
  }

  disableEditMode() {
    this.editMode = false;
    this.fileEditHeadID = '';
    this.previewPage(this.selectedPage);
  }

  openAddWikiPageModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalAddWikiPageComponent, {
      class: 'modal-md',
      initialState: {
        currentWiki: this.wikiInfo
      }
    });
  }

  openRenameWikiPageModal(page) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalRenameWikiPageComponent, {
      class: 'modal-md',
      initialState: {
        selectedWiki: this.wikiInfo,
        selectedPage: page,
      }
    });
  }

  openRemovePageModal(page) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalRemoveWikiPageComponent, {
      class: 'modal-md',
      initialState: {
        selectedPage: page,
      }
    });
  }

  savePage() {
    this.fileService.submitFileEdit(
      this.pageInfo.repo_id,
      this.pageInfo.path,
      this.fileEditHeadID,
      this.pageInfo.file_content,
      this.pageInfo.encoding).subscribe(resp => {
        this.disableEditMode();
        this.notify.showNotification('success', this.translate.instant('WIKIS.WIKI_PAGES.MESSAGES.WIKI_PAGE_EDIT_SUCCESSFULLY'));
      });
  }

  openViewHistory(page) {
    const fileDataFrompage = page;
    const routeForNavigate = `/repo/file-revision/${fileDataFrompage.repo_id}`;
    this.router.navigate([routeForNavigate], { queryParams: { p: fileDataFrompage.file_path } });
  }

}
