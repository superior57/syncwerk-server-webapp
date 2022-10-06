import { Component, OnInit } from '@angular/core';
import { AdminService } from 'app/services';

import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';

declare const jQuery: any;

@Component({
  selector: 'app-sys-admin-devices-desktop',
  templateUrl: './sys-admin-devices-desktop.component.html',
  styleUrls: ['./sys-admin-devices-desktop.component.scss']
})
export class SysAdminDevicesDesktopComponent implements OnInit {

  public perPageSelectData: Array<Select2OptionData> = [
    { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ROWS')['value']}` },
    { id: '90', text: `60 ${this.translate.instant('FORMS.SELECTS.ROWS')['value']}` },
    { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ROWS')['value']}` },
    { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')['value']}` }
  ];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  dataDeviceDesktops: any;
  currentDeviceDesktop: Object;
  openModalUnlink = false;
  isProcessing = true;
  listDeviceDesktopDisplay: Array<any> = [];
  columns: Array<any> = [
    { title: 'TABLE.COLUMNS.USER', name: 'user', width: '25%' },
    { title: 'TABLE.COLUMNS.PLATFORM_VERSION', name: 'platform', width: '15%', sort: false },
    { title: 'TABLE.COLUMNS.DEVICE_NAME', name: 'device_name', width: '20%' },
    { title: 'TABLE.COLUMNS.IP', name: 'last_login_ip', width: '15%' },
    { title: 'TABLE.COLUMNS.LAST_ACCESS', name: 'last_accessed', width: '15%' }
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
  params: any;

  constructor(
    private adminService: AdminService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    await this.getDataDeviceDesktops();
    const data = onChangeTable(this.config, this.dataDeviceDesktops.devices, this.columns, this.page);
    this.listDeviceDesktopDisplay = data.rows;
    this.length = data.length;
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.dataDeviceDesktops.devices, this.columns, config, this.page);
    this.listDeviceDesktopDisplay = data.rows;
    this.length = data.length;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.dataDeviceDesktops.devices, this.columns, page);
    this.listDeviceDesktopDisplay = data.rows;
    this.length = data.length;
  }

  getDataDeviceDesktops(): Promise<any> {
    return new Promise((resolve) => this.adminService.getSysAdminDevices('desktop').subscribe(resps => {
      this.dataDeviceDesktops = resps.data;
      this.isProcessing = false;
      resolve();
    }));
  }

  handleModalUnlink(dataDeviceDesktop: Object) {
    this.currentDeviceDesktop = dataDeviceDesktop;
    this.openModalUnlink = true;
    setTimeout(() => {
      jQuery('#unlink-device-modal')
        .on('hidden.bs.modal', () => this.openModalUnlink = false)
        .modal('show');
    });
  }

  onReloadList() {
    this.loadData();
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }
}
