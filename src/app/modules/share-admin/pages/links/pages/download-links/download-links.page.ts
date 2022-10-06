import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShareAdminService, NotificationService, ShareLinkService, FilesService } from 'app/services';
import { Observable } from 'rxjs';
import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { Select2OptionData } from 'ng2-select2';

// components
import { ViewLinkModalComponent } from '../../component/view-link-modal/view-link-modal.component';
import { ModalDeleteRemoveComponent } from 'app/modules/shared/components/modal-delete-remove/modal-delete-remove.component';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-download-links',
  templateUrl: './download-links.page.html',
  styleUrls: ['./download-links.page.scss']
})
export class DownloadLinksPageComponent implements OnInit {

  @ViewChild(ViewLinkModalComponent) private viewLinkModalComponent: ViewLinkModalComponent;
  @ViewChild(ModalDeleteRemoveComponent) private modalDeleteRemoveComponent;

  public perPageSelectData: Array<Select2OptionData> = [];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  linksList = [];
  currentShareLink: any;
  linkType = 'Download';
  isProcessing;
  isOpenModal = {
    remove: false,
    view: false,
  };
  params: any;
  linkDownload: '';
  linksListDisplay: Array<any> = [];
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
  maxSize = 5;
  numPages = 1;
  length = 0;

  constructor(
    private shareAdminService: ShareAdminService,
    private shareLinkService: ShareLinkService,
    private notification: NotificationService,
    private router: Router,
    private filesService: FilesService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.perPageSelectData = [
        { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
        { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
        { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
        { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
      ];
      this.initDataTable();
    });
  }

  initDataTable() {
    this.columns = [
      {
        title: 'TABLE.COLUMNS.NAME',
        name: 'obj_name',
        width: '35%'
      },
      {
        title: 'TABLE.COLUMNS.FOLDER',
        name: 'repo_name',
        width: '22.5%'
      },
      {
        title: 'TABLE.COLUMNS.VISITS',
        name: 'view_cnt',
        width: '12.5%'
      },
      {
        title: 'TABLE.COLUMNS.DATE_EXPIRATION',
        name: 'expire_date',
        width: '15%'
      }
    ];
    this.config.sorting.columns = this.columns;
    this.loadData();
  }

  async loadData() {
    await this.getLinkList();
    const data = onChangeTable(this.config, this.linksList, this.columns, this.page);
    this.linksListDisplay = data.rows;
    this.length = data.length;
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.linksList, this.columns, config, this.page);
    this.linksListDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.linksList, this.columns, page);
    this.linksListDisplay = data.rows;
    this.length = data.length;
  }

  getLinkList(): Promise<any> {
    return new Promise((resolve) => this.shareAdminService.getAllDownloadLinks().subscribe(resps => {
      this.linksList = resps.data;
      resolve(resps.data);
    }));
  }

  getLink(linkObj) {
    // const link = linkObj.is_dir
    //   ? this.filesService.getURLByPath(`share-link/d/${linkObj.token}`)
    //   : this.filesService.getURLByPath(`share-link/f/${linkObj.token}`);
    // return link;
    const link = linkObj.link;
    let splitUrl, newUrl;
    splitUrl = link.split('/');
    splitUrl.splice(3, 0, 'share-link');
    newUrl = splitUrl.join('/');
    return newUrl;
  }
  openObject(is_dir, repoId, path) {
    const p = path.split('/').filter(data => data.length > 0);
    const pa = p.join('/');
    if (!is_dir) {
      this.router.navigate(['preview', repoId], {
        queryParams: {
          p: path,
          ref: `/share-admin/links/download`,
        }
      });
    } else {
      if (pa === '') {
        this.router.navigate(['folders', repoId]);
      } else {
        this.router.navigate(['folders', repoId, pa]);
      }
    }
  }

  setErrorImg(index) {
    this.linksList[index].imgError = 1;
  }

  copyLinks(itemLink: string) {
    if (itemLink.includes('http://localhost:8000')) {
      const splitLink = itemLink.split('http://localhost:8000').filter((_, index) => index !== 0);
      console.log('item link: ', splitLink);
      // this.linkDownload =
    }
    this.notification.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  handleOpenModal(modalName: string, currentItemData: any) {
    this.currentShareLink = currentItemData;
    if (modalName === 'remove') {
      this.isOpenModal.remove = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.remove = false);
    } else if (modalName === 'view') {
      this.isOpenModal.view = true;
      this.openModal('#view-link-modal', () => this.isOpenModal.view = false);
    }
  }

  onRemoveItem() {
    this.shareAdminService.removeSharedDownloadLink(this.currentShareLink.token)
      .subscribe(resps => {
        this.loadData();
        jQuery('#modal-delete-remove').modal('hide');
        this.notification.showNotification('success', resps.message === '' ? this.translate.instant('NOTIFICATION_MESSAGE.SHARE_LINK_WAS_DELETED_SUCCESSFULLY') : resps.message);
      }, error => {
        console.error(error);
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }
}
