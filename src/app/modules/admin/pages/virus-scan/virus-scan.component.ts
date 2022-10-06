import { Component, OnInit } from '@angular/core';
import { AdminService, NonAuthenticationService, NotificationService } from 'app/services';

import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { Router } from '@angular/router';

import * as _ from 'lodash';
import { EMLINK } from 'constants';

@Component({
  selector: 'app-virus-scan',
  templateUrl: './virus-scan.component.html',
  styleUrls: ['./virus-scan.component.scss']
})
export class VirusScanComponent implements OnInit {


  getListVirusFromAPI;
  listVirusDataDisplay;

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
  isEnableVirusScan = false;

  constructor(
    private adminService: AdminService,
    private translate: TranslateService,
    private notify: NotificationService,
    private nonAuthService: NonAuthenticationService,
    private router: Router,

  ) {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnableVirusScan = resp.data.virusScanning;
      if (!this.isEnableVirusScan) {
        this.router.navigate(['/error', '404']);
      }
    });
   }

  ngOnInit() {
    this.getListVirusData();
  }

  getListVirusData() {
    this.adminService.getListVirusFiles().subscribe(resp => {
      this.getListVirusFromAPI = resp.data.infected_files;
      this.handlePagination();
      this.handleSort();
    });
  }

  handleSort() {
    if (this.sortConfig.column && this.sortConfig.mode) {
      const order: ReadonlyArray<boolean | 'asc' | 'desc'> = [this.sortConfig.mode === 'asc' ? 'asc' : 'desc'];
      switch (this.sortConfig.column) {
        case 'repo_name':
          this.getListVirusFromAPI = _.orderBy(this.getListVirusFromAPI, ele => ele.repo_name.toLowerCase(), order);
          break;
        case 'repo_owner':
          this.getListVirusFromAPI = _.orderBy(this.getListVirusFromAPI, ele => ele.repo_owner.toLowerCase(), order);
          break;
        case 'infected_file_path':
          this.getListVirusFromAPI = _.orderBy(this.getListVirusFromAPI, ele => ele.infected_file_path.toLowerCase(), order);
          break;
        case 'commit_id':
          this.getListVirusFromAPI = _.orderBy(this.getListVirusFromAPI, ele => ele.commit_id.toLowerCase(), order);
          break;
        case 'detected_at':
          this.getListVirusFromAPI = _.orderBy(this.getListVirusFromAPI, ele => ele.detected_at, order);
          break;
        case 'is_handled':
          this.getListVirusFromAPI = _.orderBy(this.getListVirusFromAPI, ['is_handled'], order);
          break;
      }
      this.handlePagination();
    }
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.listVirusDataDisplay = Object.assign([], this.getListVirusFromAPI);
      this.pagination.totalResult = this.getListVirusFromAPI.length;
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;
      if (this.currentSearchQuery !== '') {
        const result = this.getListVirusFromAPI.filter(ele => ele.repo_name.toLowerCase().includes(this.currentSearchQuery));
        this.listVirusDataDisplay = result.slice(start, end);
        this.pagination.totalResult = result.length;
      } else {
        this.listVirusDataDisplay = this.getListVirusFromAPI.slice(start, end);
        this.pagination.totalResult = this.getListVirusFromAPI.length;
      }
    }
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

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.getListVirusFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  pageChanged(data) {
    this.pagination.page = data.page;
    this.pagination.itemsPerPage = data.itemsPerPage;
    this.getListVirusData();
  }

  onSearchFilterChange(data) {
    if (data.keyCode === 13) {
      this.currentSearchQuery = data.target.value;
      this.pagination.page = 1;
      this.getListVirusData();
    }
  }

  onHandleVirusFile(file) {
    this.adminService.onHandleVirusFile(file.id).subscribe(resp => {
      this.notify.showNotification('success', this.translate.instant('ADMIN.VIRUS.TITLE.VIRUS_HANDLE_SUCCESS'));
      this.getListVirusData();
    }, error => {
      this.notify.showNotification('danger', this.translate.instant('ADMIN.VIRUS.TITLE.VIRUS_HANDLE_FAIL'));
    });
  }

  markFileAsFalsePositive(scanRecord) {
    this.adminService.putVirusFileMarkedAsFalsePositive(scanRecord.id).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.getListVirusData();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    });
  }
}
