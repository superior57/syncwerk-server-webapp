import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FilesService, NotificationService, I18nService, NonAuthenticationService } from '@services/index';
import { orderBy } from 'lodash';
import { environment } from 'environments/environment';
import { Select2OptionData } from 'ng2-select2';

import * as _ from 'lodash';


import { sortByColumn, onChangeTable } from 'app/app.helpers';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';

declare const jQuery: any;

@Component({
  selector: 'app-favorites-list',
  templateUrl: './favorites-list.component.html',
  styleUrls: ['./favorites-list.component.scss']
})
export class FavoritesListComponent implements OnInit {

  @Output() onReload = new EventEmitter;
  @ViewChild(ModalDeleteRemoveComponent) private modalDeleteRemoveComponent;

  public perPageSelectData: Array<Select2OptionData> = [];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  listFavorites = [];
  sortConfig = {
    column: 'name',
    mode: 'asc',
  };
  isProcessing = true;
  isOpenModal = {
    remove: false,
  };
  currentItemFavorite: any;

  // DATA TABLE
  listFavoriteDisplay: Array<any> = [];
  columns: Array<any> = [];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };
  page: any = {
    page: 1,
    itemsPerPage: 30,
    totalResult: 0,
  };
  maxSize = 5;
  numPages = 1;
  length = 0;
  params: any;


  isEnabledFilePreview = false;
  imgTypeFormat = ['jpg', 'jpeg', 'png', 'gif'];


  constructor(
    private router: Router,
    private filesService: FilesService,
    private notification: NotificationService,
    private i18nService: I18nService,
    private translate: TranslateService,
    private nonAuthService: NonAuthenticationService,

  ) {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFilePreview = resp.data.file_preview;
    });

    window.scrollTo(0, 0);
    this.initDataTable();
  }

  ngOnInit() {
  }

  initDataTable(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.perPageSelectData = [
          { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
          { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
          { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
          { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
        ];
        this.columns = [
          { title: 'TABLE.COLUMNS.FILE_NAME', name: 'file_name', width: '45%' },
          { title: 'TABLE.COLUMNS.SIZE', name: 'size', width: '10%', class: 'd-none d-lg-table-cell' },
          { title: 'TABLE.COLUMNS.LAST_UPDATE', name: 'mtime', width: '15%', class: 'd-none d-lg-table-cell' },
          { title: 'TABLE.COLUMNS.SHARED_FOLDER', name: 'repo_name', width: '20%', class: 'd-none d-lg-table-cell' }
        ];
        this.config.sorting.columns = this.columns;
        this.loadData();
      });
    });
  }

  async loadData() {
    await this.getListStarredFiles();
    await this.addLinkImg(this.listFavorites);
    const data = onChangeTable(this.config, this.listFavorites, this.columns, this.page);
    this.listFavoriteDisplay = data.rows;
    // this.length = data.length;
    this.page.totalResult = data.length;
  }

  getListStarredFiles(): Promise<any> {
    return new Promise((resolve) => {
      this.filesService.getListStarredFiles().subscribe(resps => {
        this.isProcessing = false;
        this.listFavorites = resps.data;
        for (const type of this.listFavorites) {
          const getFormatOfFile = /[^.]+$/.exec(type.file_name);
          if (this.imgTypeFormat.indexOf(getFormatOfFile[0]) !== -1) {
            type.imgError = -1;
          } else {
            type.imgError = 1;
          }
        }
        resolve();
      });
    });
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.listFavorites, this.columns, config, this.page);
    this.listFavoriteDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.listFavorites, this.columns, page);
    this.listFavoriteDisplay = data.rows;
    // this.length = data.length;
    this.page.totalResult = data.length;
  }

  openFilePreview(file) {
    this.router.navigate(['preview', file.repo_id], {
      queryParams: {
        p: file.path,
        ref: this.router.url,
      }
    });
  }

  setErrorImg(index) {
    this.listFavorites[index].imgError = 1;
  }

  triggerSort(columnName) {
    if (columnName !== this.sortConfig.column) {
      this.sortConfig.mode = 'asc';
    } else {
      if (this.sortConfig.mode === 'asc') {
        this.sortConfig.mode = 'desc';
      } else {
        this.sortConfig.mode = 'asc';
      }
    }
    this.sortConfig.column = columnName;
    this.handleSort();
  }

  // handleSort(column, mode) {
  //   this.sortConfig = { column, mode };
  //   switch (column) {
  //     case 'fileName': this.listFavorites = orderBy(this.listFavorites, ['file_name'], [mode]); break;
  //     case 'size': this.listFavorites = orderBy(this.listFavorites, ['size'], [mode]); break;
  //     case 'lastUpdate': this.listFavorites = orderBy(this.listFavorites, ['mtime'], [mode]); break;
  //     case 'repoName': this.listFavorites = orderBy(this.listFavorites, ['repo_name'], [mode]); break;
  //     default: break;
  //   }
  // }

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'file_name':
          this.listFavorites = _.orderBy(this.listFavorites, ele => ele.file_name.toLowerCase(), order);
          break;
        case 'repo_name':
          this.listFavorites = _.orderBy(this.listFavorites, ele => ele.repo_name.toLowerCase(), order);
          break;
        case 'mtime':
          this.listFavorites = _.orderBy(this.listFavorites, ['mtime'], order);
          break;
        case 'size':
          this.listFavorites = _.orderBy(this.listFavorites, ['size'], order);
          break;
      }
      this.handlePagination();
    }
  }

  handlePagination() {
    if (this.page.itemsPerPage <= 0) {
      this.listFavoriteDisplay = Object.assign([], this.listFavorites);
      this.page.totalResult = this.listFavorites.length;
    } else {
      const start = (this.page.page - 1) * this.page.itemsPerPage;
      const end = start + this.page.itemsPerPage;

      this.listFavoriteDisplay = this.listFavorites.slice(start, end);
      this.page.totalResult = this.listFavorites.length;

      // if (this.currentSearchQuery !== '') {
      //   const result = this.listFavorites.filter(ele => ele.name.toLowerCase().includes(this.currentSearchQuery));
      //   this.listFavoriteDisplay = result.slice(start, end);
      //   this.page.totalResult = result.length;
      // } else {
      // }
    }
  }


  addLinkImg(list: any[]): Promise<any> {
    return new Promise((resolve) => {
      list.forEach(ele => ele.link_img = environment.api_endpoint + `repos/${ele.repo_id}/thumbnail/?p=${ele.path}&size=500`);
      resolve();
    });
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  handleOpenModal(modalName: string, currentItem: any) {
    this.currentItemFavorite = currentItem;
    if (modalName === 'remove') {
      this.isOpenModal.remove = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.remove = false);
    }
  }

  onRemoveItem() {
    this.filesService.removeFileStarred(this.currentItemFavorite.repo_id, this.currentItemFavorite.path)
      .subscribe(resp => {
        this.loadData();
        jQuery('#modal-delete-remove').modal('hide');
        this.translate.get('FAVORITE.UNSTAR_SUCCESS', { file_name: this.currentItemFavorite.file_name })
          .subscribe(msg => this.notification.showNotification('success', msg));
      }, err => {
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.translate.get('FAVORITE.UNSTAR_FAILED').subscribe(msg => this.notification.showNotification('danger', msg));
      });
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }
}
