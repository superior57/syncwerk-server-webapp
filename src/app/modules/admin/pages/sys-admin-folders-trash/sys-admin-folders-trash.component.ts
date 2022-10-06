import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';

import { AdminService, NotificationService, FilesService, AuthenticationService } from 'app/services';
import { sortByColumn, onChangeTable } from 'app/app.helpers';

// components
import { ModalDeleteRemoveComponent } from '@shared/components/modal-delete-remove/modal-delete-remove.component';
import { ModalRestoreComponent } from '@shared/components/modal-restore/modal-restore.component';
import { ModalCleanTrashComponent } from '@shared/components/modal-clean-trash/modal-clean-trash.component';

declare const jQuery: any;

interface Column {
  title: string;
  name: string;
  width?: string;
  sort?: 'desc' | 'asc' | false | '';
}

@Component({
  selector: 'app-sys-admin-folders-trash',
  templateUrl: './sys-admin-folders-trash.component.html',
  styleUrls: ['./sys-admin-folders-trash.component.scss']
})
export class SysAdminFoldersTrashComponent implements OnInit {

  @ViewChild(ModalDeleteRemoveComponent) modalDeleteRemoveComponent;
  @ViewChild(ModalRestoreComponent) modalRestoreComponent;
  @ViewChild(ModalCleanTrashComponent) modalCleanTrashComponent;

  public perPageSelectData: Array<Select2OptionData> = [
    { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
  ];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  listReposTrash = [];
  pageInfo: { [key: string]: any } = {};
  isOpenModal = {
    delete: false,
    restore: false,
    clean_trash: false,
  };
  currentItem: any;
  userListForShare = [];
  isProcessing = true;
  params: any;
  rows: Array<any> = [];
  columns: Array<any> = [
    {
      title: 'TABLE.COLUMNS.NAME',
      name: 'name',
      width: '25%'
    },
    {
      title: 'TABLE.COLUMNS.OWNER',
      name: 'owner',
      width: '17.5%',
      class: 'd-none d-lg-table-cell'
    },
    {
      title: 'TABLE.COLUMNS.DELETED_TIME',
      name: 'delete_time',
      width: '17.5%',
      class: 'd-none d-lg-table-cell'
    }
  ];
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
  textAll;
  textSystem;
  textTrash;

  public statusSelectData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  currentUserPermission: any = {
    can_manage_folder: false,
  };

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
    private filesService: FilesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService,
    private translate: TranslateService,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;
      this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.ALL').subscribe(all => this.textAll = all);
      this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.SYSTEM').subscribe(system => this.textSystem = system);
      this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.TRASH').subscribe(trash => this.textTrash = trash);
      this.statusSelectData = [
        {
          id: 'all',
          text: this.textAll
        },
        {
          id: 'system',
          text: this.textSystem
        },
        {
          id: 'trash',
          text: this.textTrash
        }
      ];
      this.loadData();
    });
  }

  async loadData() {
    await this.handleDataFoldersTrash();
    this.rows = this.listReposTrash;
    const data = onChangeTable(this.config, this.listReposTrash, this.columns, this.page);
    this.rows = data.rows;
    this.length = data.length;
  }

  async handleDataFoldersTrash() {
    await this.getDataFoldersTrash().then(resps => {
      this.listReposTrash = resps.data.repos;
      this.pageInfo = resps.data.pageInfo;
    });
    if (this.isProcessing) { await this.waitingLoadData(); }
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.listReposTrash, this.columns, config, this.page);
    this.rows = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.listReposTrash, this.columns, page);
    this.rows = data.rows;
    this.length = data.length;
  }



  getDataFoldersTrash(): Promise<any> {
    return new Promise((resolve) => this.adminService.getTrashFolders().subscribe(resps => resolve(resps)));
  }

  waitingLoadData(): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(this.isProcessing = false), 200));
  }

  handleOpenModal(typeModal: string) {
    if (typeModal === 'delete') {
      this.isOpenModal.delete = true;
      this.openModal('#modal-delete-remove', () => this.isOpenModal.delete = false);
    } else if (typeModal === 'restore') {
      this.isOpenModal.restore = true;
      this.openModal('#modal-restore', () => this.isOpenModal.restore = false);
    } else if (typeModal === 'clean-trash') {
      this.isOpenModal.clean_trash = true;
      this.openModal('#modal-clean-trash', () => this.isOpenModal.clean_trash = false);
    }
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  deleteItem(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal('delete');
  }

  restoreItem(dataItem: any) {
    this.currentItem = dataItem;
    this.handleOpenModal('restore');
  }

  handleDeleteItem() {
    this.adminService.deleteItemTrashFolders(this.currentItem.id).subscribe(
      resps => {
        this.loadData();
        jQuery('#modal-delete-remove').modal('hide');
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  handleRestoreItem() {
    this.adminService.putRestoreItemTrashFolders(this.currentItem.id).subscribe(
      resps => {
        this.loadData();
        jQuery('#modal-restore').modal('hide');
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.modalDeleteRemoveComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).meesage);
      });
  }

  handleCleanTrash() {
    this.adminService.deleteCleanTrashFolders().subscribe(
      resps => {
        this.loadData();
        jQuery('#modal-clean-trash').modal('hide');
        this.notification.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.modalCleanTrashComponent.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  changeFolder(event) {
    this.router.navigate(['admin/folders/' + event.value + '-lib']);
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }
}
