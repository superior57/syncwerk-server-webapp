import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select2OptionData } from 'ng2-select2';

import { FilesService, MessageService, NotificationService } from '@services/index';
import { Action, Type } from '@enum/index.enum';
import { TranslateService } from '@ngx-translate/core';

import { sortByColumn, onChangeTable } from 'app/app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-historys',
  templateUrl: './historys.component.html',
  styleUrls: ['./historys.component.scss']
})
export class HistorysComponent implements OnInit {

  @Output() DetailsHistoryFile: EventEmitter<any> = new EventEmitter<any>();

  public perPageSelectData: Array<Select2OptionData> = [];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  pathArr = [];
  repoId: string;
  repoName: string;
  path = '/';
  isProcessing = true;
  bredcrumbs = [];
  more: boolean;
  detailsData = [];
  dir_permission: string;
  params: any;

  listHistory = [];
  listHistoryDisplay = [];

  columns: Array<any> = [];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };

  pagination: any = {
    page: 1,
    itemsPerPage: 30,
    totalNumberOfResult: 0
  };

  maxSize = 5;
  numPages = 1;
  length = 0;
  countAPIElm = 0;

  allowViewSnapshot = false;
  currentSearchQuery = '';
  currentSnapshot = '';


  slash = '#';
  symbol = 'a';
  titles = {
    'deldir': 'Removed directory',
    'modified': 'Modifiedd file',
    'new': 'Add new file',
    'newdir': 'Add new directory',
    'removed': 'Removed file',
    'renamed': 'Rename file'
  };
  dateTime: string;
  detailsHistory = [];
  expandAll = false;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
    private location: Location,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.perPageSelectData = [
      { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
      { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
      { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
      { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
    ];
    this.route.queryParams.subscribe(params => {
      this.pathArr = (params['path'] || '').split('/');
      this.handleQueryParams(this.pathArr);
      // this.initDataTable();
      this.getHistoryWithPath();
    });
  }

  getHistoryWithPath() {
    this.fileService.getHistoryPanigation(this.repoId).subscribe(resp => {
      if (!resp.data.allow_view_history) {
        this.router.navigate(['/error', '404']);
      }
      this.allowViewSnapshot = resp.data.allow_view_snapshot;
      this.dir_permission = resp.data.permission;
      this.repoName = this.handleString(resp.data.repo_name, 60, 45, 10);
      this.more = resp.data.more;
      for (const comit of resp.data.commits) {
        if (this.countAPIElm === 0) {
          comit.currentSnapshot = true;
        }
        this.countAPIElm++;
      }
      this.listHistory = resp.data.commits;
      this.pagination.totalNumberOfResult = resp.data.total_number_of_commits;
      this.handlePagination();
      this.isProcessing = false;
    });
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.listHistoryDisplay = Object.assign([], this.listHistory);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        const result = this.listHistory.filter(ele => ele.description.toLowerCase().includes(this.currentSearchQuery)).slice(start, end);
        this.listHistoryDisplay = result.slice(start, end);
        this.pagination.totalNumberOfResult = result.length;
      } else {
        this.listHistoryDisplay = this.listHistory.slice(start, end);
      }
    }
    for (const commit of this.listHistoryDisplay) {
      commit.detailsForDisplay = this.customDetails(commit.details);
    }
  }

  handleQueryParams(data: string[]) {
    let path = '/';
    let repoId = '';
    const params = data;
    if (params.length > 1) {
      repoId = params.shift();
      path = path + params.join('/');
    } else {
      repoId = params[0];
    }
    this.repoId = repoId;
    this.path = path;
  }



  openSnapshot(item) {
    console.log(`item is`, item);
    this.router.navigate(['files', 'history', 'view', this.repoId], { queryParams: { commit_id: item.commit_id, path: this.path } });
  }

  // nextPage() {
  //   if (this.more === true) {
  //     this.pagination.page += 1;
  //     this.loadData();
  //   }
  // }

  // prevPage() {
  //   if (this.pagination.page > 1) {
  //     this.pagination.page -= 1;
  //     this.loadData();
  //   }
  // }

  customDetails(data) {
    const populatedResult = [];
    const commitTypes = Object.keys(data);
    for (const type of commitTypes) {
      for (const item of data[type]) {
        populatedResult.push({
          type: type,
          itemName: item,
        });
      }
    }
    return populatedResult;
  }

  profileName(email) {
    this.router.navigate(['user', 'profile', email]);
  }

  send(data: any[], type: any) {
    const payload = {
      type: type,
      data: data,
    };
    this.messageService.broadcast(type, payload);
  }

  backPage() {
    this.location.back();
  }

  /**
   * limitStr >= headStr + endStr + 5
   * |(headStr - endStr)| >= 5
  **/
  handleString(string: string, limitStr: number = 30, headStr: number = 20, endStr: number = 5) {
    if (limitStr >= (headStr + endStr + 5) && Math.abs(headStr - endStr) >= 5) {
      if (string.length > limitStr) {
        const cutHeadString = string.substring(0, headStr);
        const cutEndString = string.substring(string.length - endStr, string.length);
        return cutHeadString + ' ... ' + cutEndString;
      } else {
        return string;
      }
    } else {
      console.error('The input value of the handleString is incorrect.');
    }
  }

  // onPerPageChanged(data) {
  //   this.pagination.itemsPerPage = 1;
  //   // this.loadData();
  // }
  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.listHistory.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }


  sortColumn(column, config) {
    const data = sortByColumn(column, this.listHistory, this.columns, config, this.pagination);
    this.listHistoryDisplay = data.rows;
  }

  onSearchFilterChange(queryData) {
    this.currentSearchQuery = queryData.target.value;
    this.pagination.page = 1;
    this.getHistoryWithPath();
  }

  pageChanged(data) {
    this.pagination.page = data.page;
    this.pagination.itemsPerPage = data.itemsPerPage;
    this.handlePagination();
  }

  onExpandCollapseAll() {
    this.expandAll = !this.expandAll;
    this.handleToogleCollapseExpand();
  }

  handleToogleCollapseExpand() {
    const listCollapseElm = document.getElementsByClassName('collapse');
    for (let i = 0; i < listCollapseElm.length; i++) {
      if (this.expandAll) {
        listCollapseElm[i].classList.add('show');
      } else {
        listCollapseElm[i].classList.remove('show');
      }
    }
  }
}
