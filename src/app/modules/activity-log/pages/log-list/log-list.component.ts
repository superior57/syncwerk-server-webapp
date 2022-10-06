import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LogsService, AuthenticationService, NotificationService } from '@services/index';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-log-list',
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.scss']
})
export class LogListComponent implements OnInit {

  currentUserInfo: any = {};

  activityLogListFromAPI = [];
  activityLogListForDisplay = [];

  isProcessing = false;

  currentSearchQuery = '';

  pagination = {
    page: 1,
    per_page: 10,
    totalItems: 0
  };

  maxSize = 5;
  q = '';

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  constructor(
    private logService: LogsService,
    private authService: AuthenticationService,
    private router: Router,
    private noti: NotificationService,

  ) { }

  ngOnInit() {
    this.isProcessing = true;
    this.authService.userInfo().subscribe(resp => {
      this.currentUserInfo = resp.data;
      this.getActivityLogList();
    });
  }


  getActivityLogList() {
    this.isProcessing = true;
    this.logService.getUserActivityListLog(this.pagination.page, this.pagination.per_page, this.q).subscribe(resp => {
      this.activityLogListFromAPI = resp.data.user_activities;
      this.handleUserActivityData(this.activityLogListFromAPI);
      this.handlePaginitionData(resp.data.page_info);
      this.isProcessing = false;
    });

  }

  handlePaginitionData(pageInfo){
    this.pagination.totalItems = pageInfo.total_result;
    this.pagination.page = pageInfo.current_page;
  }

  handleLogListData() {
    this.activityLogListFromAPI = _.orderBy(this.activityLogListFromAPI, ['datetime'], ['desc']);
    for (const a of this.activityLogListFromAPI) {
      a.date = moment(a.datetime).format('YYYY-MM-DD');
    }
    this.handlePagination();
  }

  handleUserActivityData(userActivityData){
    for(const dateData in userActivityData){
      
      for(const activityId in userActivityData[dateData].activities){
        const html_sentence = this.formatString(userActivityData[dateData].activities[activityId]);
        userActivityData[dateData].activities[activityId].html_sentence = html_sentence;
      }
    }

    this.activityLogListForDisplay = userActivityData;
  }

  formatString(log){
    const re = /\%\((.+?)\)s/g
    const regexMatchs = log.sentence.match(re);

    let result = log.sentence;

    for(const fieldId in regexMatchs){
      const fieldName = this.replaceFormatKey(regexMatchs[fieldId]);

      const replaceHtml = '<span class="'+fieldName+'">'+log[fieldName]+'</span>'

      result = result.replace(regexMatchs[fieldId],replaceHtml)
    }
    return result;

  }

  replaceFormatKey(sentence){
    return sentence.split("%(").join("").split(")s").join("");
  }

  handlePagination() {
    if (this.pagination.per_page <= 0) {
      this.pagination.totalItems = this.activityLogListFromAPI.length;
      this.activityLogListForDisplay = Object.assign([], this.activityLogListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.per_page;
      const end = start + this.pagination.per_page;

      if (this.currentSearchQuery !== '') {
        const result = this.activityLogListFromAPI.filter(ele => JSON.stringify(ele).toLowerCase().includes(this.currentSearchQuery));
        this.pagination.totalItems = result.length;
        this.activityLogListForDisplay = result;
      } else {
        this.pagination.totalItems = this.activityLogListFromAPI.length;
        this.activityLogListForDisplay = this.activityLogListFromAPI.slice(start, end);
      }
    }
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.per_page = this.pagination.totalItems;
    } else {
      this.pagination.page = 1;
      this.pagination.per_page = newItemsPerPage;
    }
    this.getActivityLogList();
  }

  pageChanged(data) {
    this.pagination.page = data.page;
    this.getActivityLogList();

  }

  onSearchFilterChange(data) {
    if(this.q != data.target.value){
      this.q = data.target.value;
      if(this.pagination.page == 1){
        this.getActivityLogList();
      }
      this.pagination.page = 1;
    }
  }

  openFilePreview(repo_id, file_path) {
    this.router.navigate(['preview', repo_id], {
      queryParams: {
        p: file_path,
        ref: this.router.url
      }
    });
  }

  handleUserActivityClick(log){
    // Navigate to folder
    if( [
      "Added dir",
      "Share to user",
      "Share to group",
      "Change user permission", 
      "Change group permission",
      "Remove user share", 
      "Remove group share",
      "Create upload link",
      "Remove upload link",
      
    ].includes(log.action_type)){
      this.navigateToFolder(log);
    }

    // Navigate to file
    if( ["File access","Added file","Modified file"].includes(log.action_type)){
      this.navigateToFile(log);
    }

  }

  navigateToFolder(log){
    if(log.sub_folder_file){
      const sub_folder_files = log.sub_folder_file.replace("/","").split("/");

      this.router.navigate(['folders', log.folder_id].concat(sub_folder_files));
    }
    else{
      this.router.navigate(['folders', log.folder_id]);
    }
  }

  navigateToFile(log){
    this.router.navigate(['preview', log.folder_id], {
      queryParams: {
        p: log.user_sub_folder_file,
        ref: this.router.url
      }
    });
  }

  exportToCsv() {
    this.logService.getExportUserActivityListLogToCSV().subscribe(resp => {
      window.location.href = resp.url;
    }, error => {
      console.log(error);
      // this.noti.showNotification('danger', JSON.parse(error._body).message);
    });
  }
}
