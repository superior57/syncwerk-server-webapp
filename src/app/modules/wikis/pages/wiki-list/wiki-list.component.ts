
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { CookieService } from 'ngx-cookie';


import { WikiService, NotificationService, NonAuthenticationService } from 'app/services';

import { ModalCreateNewWikiComponent } from '../../components/modal-create-new-wiki/modal-create-new-wiki.component';
import { ModalCreateWikiFromExistingFolderComponent } from '../../components/modal-create-wiki-from-existing-folder/modal-create-wiki-from-existing-folder.component';
import { ModalRenameWikiComponent } from '../../components/modal-rename-wiki/modal-rename-wiki.component';
import { ModalRemoveWikiComponent } from '../../components/modal-remove-wiki/modal-remove-wiki.component';

import * as _ from 'lodash';

@Component({
  selector: 'app-wiki-list',
  templateUrl: './wiki-list.component.html',
  styleUrls: ['./wiki-list.component.scss']
})
export class WikiListComponent implements OnInit, AfterViewInit {
  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;

  wikiListFromAPI = [];
  wikiListForDisplay = [];

  currentSearchQuery = '';

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  maxSize = 5;

  sortConfig = {
    column: '',
    mode: '',
  };

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  isGetWikiEnabled = false;
  isListView = false;
  rangeSizeGrid;

  // For slider
  rangeTransformScale: number;
  classRangeSize: string;
  rangeHeightPx: string;

  constructor(
    private router: Router,
    private wikiService: WikiService,
    private notify: NotificationService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private nonAuthService: NonAuthenticationService,
    private cookieService: CookieService,
  ) {
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
  }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isGetWikiEnabled = resp.data.wiki;
      if (!this.isGetWikiEnabled) {
        this.router.navigate(['/error', '404']);
      }
    });
    this.isProcessing = true;
    this.getListWikis();
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';
  }

  onChangeRangeSizeGrid(e) {
    this.rangeSizeGrid = e;
    this.handleChangeRangeSize();
    this.cookieService.put('syc_range_size', this.rangeSizeGrid);
  }

  ngAfterViewInit() {
    this.handleChangeRangeSize();
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'name':
          this.wikiListFromAPI = _.orderBy(this.wikiListFromAPI, ele => ele.name.toLowerCase(), order);
          break;
        case 'owner':
          this.wikiListFromAPI = _.orderBy(this.wikiListFromAPI, ele => ele.owner.toLowerCase(), order);
          break;
        case 'last_update':
          this.wikiListFromAPI = _.orderBy(this.wikiListFromAPI, ['updated_at'], order);
          break;
      }
      this.handlePagination();
    }
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
        this.getListWikis();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  getListWikis() {
    this.wikiService.getListWiki().subscribe(resp => {
      console.log(resp);
      this.wikiListFromAPI = resp.data;
      this.handlePagination();
      this.isProcessing = false;
    });
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.wikiListForDisplay = Object.assign([], this.wikiListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.wikiListForDisplay = this.wikiListFromAPI.filter(ele => ele.name.toLowerCase().includes(this.currentSearchQuery)).slice(start, end);
      } else {
        this.wikiListForDisplay = this.wikiListFromAPI.slice(start, end);
      }
    }
  }

  onSearchFilterChange(data) {
    const currentTimeStamp = new Date();
    if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
      clearTimeout(this.searchTimeOut);
    }
    this.searchChangeTimeStamp = currentTimeStamp;
    this.searchTimeOut = setTimeout(() => {
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.getListWikis();
    }, this.searchDelayInMilliseconds);
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.wikiListFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  pageChanged(data) {
    this.pagination = data;
    this.handlePagination();
  }

  triggerSort(columnName) {
    if (columnName !== this.sortConfig.column) {
      this.sortConfig.mode = 'asc';
    } else {
      if (this.sortConfig.mode === '') {
        this.sortConfig.mode = 'asc';
      } else if (this.sortConfig.mode === 'asc') {
        this.sortConfig.mode = 'desc';
      } else {
        this.sortConfig.mode = '';
      }
    }
    this.sortConfig.column = columnName;
    this.handleSort();
  }

  openCreateNewWikiModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateNewWikiComponent, {
      class: 'modal-md'
    });
  }

  openCreateWikiFromExistingFolderModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateWikiFromExistingFolderComponent, {
      class: 'modal-lg'
    });
  }

  openRenameWikiModal(wiki) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalRenameWikiComponent, {
      class: 'modal-md',
      initialState: {
        selectedWiki: wiki,
      }
    });
  }

  openRemoveWikiModal(wiki) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalRemoveWikiComponent, {
      class: 'modal-md',
      initialState: {
        selectedWiki: wiki,
      }
    });
  }

  handleChangeRangeSize() {
    const numberRangeSize = Number(this.rangeSizeGrid);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 110 && numberRangeSize < 150) {
      this.rangeTransformScale = (numberRangeSize + 20) / 100;
      this.classRangeSize = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
      this.rangeTransformScale = (numberRangeSize + 40) / 100;
      this.classRangeSize = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
    }
    this.rangeHeightPx = 100 * this.rangeTransformScale + 'px';
  }

}
