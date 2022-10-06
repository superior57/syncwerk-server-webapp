import { Component, OnInit } from '@angular/core';
import { AdminService, NonAuthenticationService } from 'app/services';

import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { Router } from '@angular/router';

declare const jQuery: any;

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {
  listDevice: any;
  openModalUnlink = false;
  currentDevice: Object;
  isProcessing = true;
  listDeviceDisplay: Array<any> = [];
  columns: Array<any> = [
    { title: 'TABLE.COLUMNS.PLATFORM_VERSION', name: 'platform', width: '20%', sort: false, class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.USER', name: 'user', width: '10%' },
    { title: 'TABLE.COLUMNS.DEVICE_NAME', name: 'device_name', width: '20%', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.IP', name: 'last_login_ip', width: '15%', class: 'd-none d-lg-table-cell' },
    { title: 'TABLE.COLUMNS.LAST_ACCESS', name: 'last_accessed', width: '15%', class: 'd-none d-lg-table-cell' }
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

  isEnabledAdminArea = false;


  constructor(
    private adminService: AdminService,
    private translate: TranslateService,
    private nonAuthService: NonAuthenticationService,
    private router: Router

  ) { }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminArea = resp.data.admin_area;
      if (!this.isEnabledAdminArea) {
        this.router.navigate(['/error', '404']);
      }
    });
    this.loadData();
  }

  async loadData() {
    await this.getDataDeviceMobiles();
    const data = onChangeTable(this.config, this.listDevice.devices, this.columns, this.page);
    this.listDeviceDisplay = data.rows;
    this.length = this.listDevice.page_info.total_result;
  }

  sortColumn(column, config) {
    this.adminService.getSysAdminDevices('', this.page.page, this.page.itemsPerPage).subscribe(resps => {
      this.listDevice = resps.data;
      const data = sortByColumn(column, this.listDevice.devices, this.columns, config, this.page.page);
      this.listDeviceDisplay = data.rows;
      this.length = this.listDevice.page_info.total_result;
    });
  }

  changeTable(config, page = this.page) {
    this.adminService.getSysAdminDevices('', page.page, this.page.itemsPerPage).subscribe(resps => {
      this.listDevice = resps.data;
      const data = onChangeTable(config, this.listDevice.devices, this.columns, page.page);
      this.listDeviceDisplay = data.rows;
      this.length = this.listDevice.page_info.total_result;
    });
  }

  getDataDeviceMobiles(): Promise<any> {
    return new Promise((resolve) => this.adminService.getSysAdminDevices('', this.page.page, this.page.itemsPerPage).subscribe(resps => {
      this.listDevice = resps.data;
      this.isProcessing = false;
      resolve();
    }));
  }

  handleModalUnlink(dataDeviceMobile: Object) {
    this.currentDevice = dataDeviceMobile;
    this.openModalUnlink = true;
    setTimeout(() => {
      jQuery('#modal-unlink-device')
        .on('hidden.bs.modal', () => this.openModalUnlink = false)
        .modal('show');
    });
  }

  onReloadList() {
    this.loadData();
    jQuery('#modal-unlink-device').modal('hide');
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.loadData();
  }
}
