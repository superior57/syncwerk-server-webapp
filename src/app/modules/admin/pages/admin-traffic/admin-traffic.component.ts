import { Component, OnInit } from '@angular/core';
import { AdminService, NonAuthenticationService, NotificationService } from 'app/services';

import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { Router } from '@angular/router';

import * as _ from 'lodash';


@Component({
  selector: 'app-admin-traffic',
  templateUrl: './admin-traffic.component.html',
  styleUrls: ['./admin-traffic.component.scss']
})
export class AdminTrafficComponent implements OnInit {


  getListDataTrafficAPI;
  listDataTrafficDisplay;

  isProcessing = false;
  pagination = {
    page: 1,
    itemsPerPage: 30,
    totalResult: 0,
  };
  maxSize = 5;
  sortConfig = {
    column: 'name',
    mode: 'asc',
  };
  config: any = {
    paging: true,
    filtering: { filterString: '' },
  };

  currentSearchQuery = '';
  getYearAndMonthInput = '';
  regexCheckNumberOnly = /^[1-9]\d*$/;
  getDateTime;
  isEnabledAdminTraffic = false;

  constructor(
    private adminService: AdminService,
    private translate: TranslateService,
    private notify: NotificationService,
    private nonAuthService: NonAuthenticationService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminTraffic = resp.data.trafficTracking;
      if (!this.isEnabledAdminTraffic) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.getDateTime = this.getCurrentYearAndMonth();
    this.getListDataTraffic(this.getDateTime);
  }

  getCurrentYearAndMonth() {
    const today = new Date();
    const getYear = today.getFullYear();
    const getMonth = String(today.getMonth() + 1).padStart(2, '0');
    return getYear.toString() + getMonth.toString();
  }

  getListDataTraffic(yearAndMonth) {
    this.adminService.getAllDataTraffic(yearAndMonth).subscribe(resp => {
      this.getListDataTrafficAPI = resp.data.traffic_data;
      this.handlePagination();
      this.handleSort();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    });
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

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'user_email':
          this.getListDataTrafficAPI = _.orderBy(this.getListDataTrafficAPI, ele => ele.user_email.toLowerCase(), order);
          break;
        case 'sync_upload':
          this.getListDataTrafficAPI = _.orderBy(this.getListDataTrafficAPI, ['sync_upload'], order);
          break;
        case 'sync_donwload':
          this.getListDataTrafficAPI = _.orderBy(this.getListDataTrafficAPI, ['sync_donwload'], order);
          break;
        case 'web_upload':
          this.getListDataTrafficAPI = _.orderBy(this.getListDataTrafficAPI, ['web_upload'], order);
          break;
        case 'web_download':
          this.getListDataTrafficAPI = _.orderBy(this.getListDataTrafficAPI, ['web_download'], order);
          break;
        case 'share_link_upload':
          this.getListDataTrafficAPI = _.orderBy(this.getListDataTrafficAPI, ['share_link_upload'], order);
          break;
        case 'share_link_download':
          this.getListDataTrafficAPI = _.orderBy(this.getListDataTrafficAPI, ['share_link_download'], order);
          break;
      }
      this.handlePagination();
    }
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.listDataTrafficDisplay = Object.assign([], this.getListDataTrafficAPI);
      this.pagination.totalResult = this.getListDataTrafficAPI.length;
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;
      if (this.currentSearchQuery !== '') {
        const result = this.getListDataTrafficAPI.filter(ele => ele.user_email.toLowerCase().includes(this.currentSearchQuery));
        this.listDataTrafficDisplay = result.slice(start, end);
        this.pagination.totalResult = result.length;
      } else {
        this.listDataTrafficDisplay = this.getListDataTrafficAPI.slice(start, end);
        this.pagination.totalResult = this.getListDataTrafficAPI.length;
      }
    }
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.getListDataTrafficAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  pageChanged(data) {
    this.pagination.page = data.page;
    this.pagination.itemsPerPage = data.itemsPerPage;
    this.getListDataTraffic(this.getCurrentYearAndMonth());
  }

  onSearchFilterChange(data) {
    if (data.keyCode === 13) {
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.getListDataTraffic(this.getCurrentYearAndMonth());
    }
  }

  onSearchDataByYearAndMonth(data) {
    if (data.keyCode === 13) {
      this.getYearAndMonthInput = data.target.value;
      if (this.getYearAndMonthInput.length >= 7) {
        this.notify.showNotification('danger', this.translate.instant('ADMIN.TRAFFIC.TITLE.TRAFFIC_CHECK_LENGTH'));
      } else if (this.regexCheckNumberOnly.test(this.getYearAndMonthInput) === false) {
        this.notify.showNotification('danger', this.translate.instant('ADMIN.TRAFFIC.TITLE.TRAFFIC_CHECK_NUMBER_INPUT'));
      } else if (this.getYearAndMonthInput.length <= 5) {
        this.notify.showNotification('danger', this.translate.instant('ADMIN.TRAFFIC.TITLE.TRAFFIC_CHECK_NUMBER_DATE_LENGTH'));
      } else {
        this.pagination.page = 1;
        this.getListDataTraffic(this.getYearAndMonthInput);
      }
    }
  }


}
