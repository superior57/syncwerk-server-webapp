import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FilesService, NotificationService, I18nService, NonAuthenticationService } from '@services/index';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Select2OptionData } from 'ng2-select2';
import { sortByColumn, onChangeTable } from 'app/app.helpers';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';

declare const jQuery: any;

@Component({
  selector: 'app-favorites-grid',
  templateUrl: './favorites-grid.component.html',
  styleUrls: ['./favorites-grid.component.scss']
})
export class FavoritesGridComponent implements OnInit {

  @Input() dataRangeSizeGrid;
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
  isProcessing = true;
  currentItemFavorite: any;
  isOpenModal = {
    remove: false,
  };
  listFavoriteDisplay: Array<any> = [];
  columns: Array<any> = [];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };
  page: any = {
    page: 1,
    itemsPerPage: 30
  };
  length = 0;
  maxSize = 5;
  numPages = 1;

  isEnabledFilePreview = false;
  imgTypeFormat = ['jpg', 'jpeg', 'png', 'gif'];

  constructor(
    private filesService: FilesService,
    private router: Router,
    private notification: NotificationService,
    private i18nService: I18nService,
    private translate: TranslateService,
    private nonAuthService: NonAuthenticationService,

  ) {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFilePreview = resp.data.file_preview;
    });
    this.initDataTable();
    this.loadListFavorite();
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
          { title: 'TABLE.COLUMNS.SIZE', name: 'size', width: '10%' },
          { title: 'TABLE.COLUMNS.LAST_UPDATE', name: 'mtime', width: '15%' },
          { title: 'TABLE.COLUMNS.SHARED_FOLDER', name: 'repo_name', width: '20%' }
        ];
        this.config.sorting.columns = this.columns;
      });
    });
  }

  async loadListFavorite() {
    await this.getListStarredFiles();
    const data = onChangeTable(this.config, this.listFavorites, this.columns, this.page);
    this.listFavoriteDisplay = data.rows;
    this.length = data.length;
  }

  getListStarredFiles(): Promise<any> {
    return new Promise((resolve, reject) => {
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
        this.addLinkImg(resps.data);
        resolve();
      });
    });
  }

  setErrorImg(index) {
    this.listFavorites[index].imgError = 1;
  }

  openFilePreview(file) {
    this.router.navigate(['preview', file.repo_id], {
      queryParams: {
        p: file.path,
        ref: this.router.url,
      }
    });
  }

  addLinkImg(list: any[]) {
    list.forEach(ele => ele.link_img = environment.api_endpoint + `repos/${ele.repo_id}/thumbnail/?p=${ele.path}&size=500`);
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
        // this.getListStarredFiles();
        this.loadListFavorite();
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
    this.loadListFavorite();
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.listFavorites, this.columns, page);
    this.listFavoriteDisplay = data.rows;
    this.length = data.length;
  }
}
