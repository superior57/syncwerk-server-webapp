import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OtherService, NotificationService, I18nService } from '@services/index';
import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { Select2OptionData } from 'ng2-select2';
import { CookieService } from 'ngx-cookie';
declare const jQuery: any;

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, AfterViewInit {

  params: any;
  linkedDevices = [];
  currentDevice: any;
  isOpenModal = {
    remove: false,
  };
  listLinkedDevicesDisplay: Array<any> = [];
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
  isProcessing = true;
  isListView = false;


  // For slider
  rangeTransformScale: number;
  classRangeSize: string;
  rangeHeightPx: string;
  rangeSizeGrid;
  marginTop;

  constructor(
    private otherService: OtherService,
    private noti: NotificationService,
    private translate: TranslateService,
    private i18nService: I18nService,
    private cookieService: CookieService,
  ) {
    translate.use(i18nService.getLanguage());
    const cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
    this.rangeSizeGrid = (cookieRangeSize >= 100 && cookieRangeSize <= 160) ? this.cookieService.get('syc_range_size') : 100;
  }

  ngOnInit() {
    // set the view type
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';
    setTimeout(() => {
      this.initDataTable();
    });
  }

  onChangeRangeSizeGrid(e) {
    this.rangeSizeGrid = e;
    this.handleChangeRangeSize();
    this.cookieService.put('syc_range_size', this.rangeSizeGrid);
  }

  ngAfterViewInit() {
    this.handleChangeRangeSize();
  }

  initDataTable() {
    this.columns = [
      { title: 'LINKED_DEVICE.PLATFORM_COL', name: 'platform', width: '35%' },
      { title: 'LINKED_DEVICE.DEVICE_NAME_COL', name: 'device_name', width: '20%', class: 'd-none d-lg-table-cell' },
      { title: 'LINKED_DEVICE.IP_COL', name: 'last_login_ip', width: '15%', class: 'd-none d-lg-table-cell' },
      { title: 'LINKED_DEVICE.LAST_ACCESS_COL', name: 'last_accessed', width: '15%', class: 'd-none d-lg-table-cell' }
    ];
    this.config.sorting.columns = this.columns;
    this.loadData();
  }

  async loadData() {
    this.linkedDevices = await this.getLinkedDevices();
    const data = onChangeTable(this.config, this.linkedDevices, this.columns, this.page);
    this.listLinkedDevicesDisplay = data.rows;
    this.length = data.length;
    this.isProcessing = false;
  }
  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.linkedDevices, this.columns, config, this.page);
    this.listLinkedDevicesDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.linkedDevices, this.columns, page);
    this.listLinkedDevicesDisplay = data.rows;
    this.length = data.length;
  }

  getLinkedDevices(): Promise<any> {
    return new Promise(resolve => this.otherService.getLinkedDevicesList().subscribe(resp => resolve(resp.data)));
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show'));
  }

  handleOpenModal(modalName: string, currentItem: any) {
    this.currentDevice = currentItem;
    if (modalName === 'remove') {
      this.isOpenModal.remove = true;
      this.openModal('#modal-unlink-device', () => this.isOpenModal.remove = false);
    }
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }

  handleChangeRangeSize() {
    const numberRangeSize = Number(this.rangeSizeGrid);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
      this.rangeHeightPx = 100 * this.rangeTransformScale + 'px';
    } else if (numberRangeSize >= 110 && numberRangeSize < 150) {
      this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
      this.rangeHeightPx = 100 * this.rangeTransformScale + 'px';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
       this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
      this.rangeHeightPx = (100 * this.rangeTransformScale) - 20 + 'px';
    }
  }
}
