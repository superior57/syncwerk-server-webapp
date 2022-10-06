import { flatten } from '@angular/compiler';
import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';

import { AppConfig } from 'app/app.config';
import { User } from 'app/Models/User.model';
import { FilesService, NotificationService, AuthenticationService, MessageService } from '@services/index';

import { onChangeTable } from 'app/app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-view-snapshot',
  templateUrl: './view-snapshot.component.html',
  styleUrls: ['./view-snapshot.component.scss']
})
export class ViewSnapshotComponent implements OnInit {

  userInfo: User = new User('', '', '');
  currentRepo = '';
  currentFilePath = '';
  currentCommitID = '';
  listFiles = [];
  pathData = '';
  repoName = '';
  path = '/';
  resData = [];
  resDataCurrentCommit = [];
  isProcessing = true;
  breadcrumbs = {};
  allowRestoreSnapshot = false;


  public perPageSelectData: Array<Select2OptionData> = [];
  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  page: any = {
    page: 1,
    itemsPerPage: 30
  };
  columns: Array<any> = [];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };
  listFilesDisplay: Array<any> = [];
  more: boolean;
  isDefaultAvatar = false;

  listTypeImage = ['jpg', 'jpeg', 'png', 'pneg'];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
    private appConfig: AppConfig,
    private authenService: AuthenticationService,
    private location: Location,
    private translate: TranslateService,
  ) {
    this.activatedRoute.params.subscribe(params => this.currentRepo = params['repoId']);
    this.activatedRoute.queryParamMap.subscribe(qpm => {
      // this.currentRepo = qpm.get('repo_id');
      this.currentFilePath = qpm.get('path');
      this.currentCommitID = qpm.get('commit_id');
      // this.getInfoSnapshotWithPath(this.currentFilePath);
      this.getUserInfo();
      this.initDataTable();
    });
  }

  ngOnInit() { }

  initDataTable() {
    setTimeout(() => {
      this.perPageSelectData = [
        { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
        { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
        { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
        { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
      ];
      this.columns = [
        { title: 'TABLE.COLUMNS.NAME', name: 'obj_name' },
        { title: 'TABLE.COLUMNS.SIZE', name: 'size' },
        { title: 'TABLE.COLUMNS.OPERATIONS', name: 'Actions' }
      ];
      this.config.sorting.columns = this.columns;

      this.loadData();
    });
  }


  async loadData() {
    await this.getInfoSnapshotWithPath(this.currentFilePath);
    this.fileService.getSnapshotPanigation(this.currentRepo, this.currentCommitID, this.currentFilePath).subscribe(resp => {
      this.listFiles = resp.data.dir_list.concat(resp.data.file_list);
      this.listFiles.forEach( (file) => {
        file.isImage = this.isImage(file.obj_name);
      });
      const data = onChangeTable(this.config, this.listFiles, this.columns, this.page);
      this.listFilesDisplay = data.rows;
      this.listFilesDisplay.length > 9 ? this.more = true : this.more = false;
    });
  }

  isImage(fileName) {
    const fileNameArr = fileName.split('.');
    if (fileNameArr.length <= 1) {
      return false;
    }
    const fileExt = fileNameArr[fileNameArr.length - 1];
    if (this.listTypeImage.includes(fileExt.toLowerCase())) {
      return true;
    }
    return false;
  }


  onPerPageChanged(data) {
    this.page.itemsPerPage = data.value;
    // this.getInfoSnapshotWithPath(this.currentFilePath);
    console.log(`itemsPerpage`, this.page.itemsPerpage);

    this.loadData();
  }

  prevPage() {
    if (this.page.page > 1) {
      this.page.page -= 1;
      this.loadData();
    }
  }

  nextPage() {
    if (this.more === true) {
      this.page.page += 1;
      this.loadData();
    }
  }


  getInfoSnapshotWithPath(path: string) {
    this.fileService.getSnapshotPanigation(this.currentRepo, this.currentCommitID, path)
      .subscribe(resp => {
        if (!resp.data.repo.allow_view_snapshot) {
          this.router.navigate(['/error', '404']);
        }
        this.allowRestoreSnapshot = resp.data.repo.allow_restore_snapshot;
        this.resData = resp.data;
        this.resDataCurrentCommit = resp.data.current_commit;
        this.pathData = resp.data.path;
        this.listFiles = [];
        for (const el of resp.data.dir_list) { this.listFiles.push(el); }
        for (const els of resp.data.file_list) { this.listFiles.push(els); }
        this.repoName = resp.data.repo.name;
        this.isProcessing = false;
        this.handleBreadcrumbs();
      }, error => { });
  }

  restoreSnapshot(commit_id: string, data: any) {
    const type = data.obj_id ? 'file' : 'dir';
    const path = this.currentFilePath === '/' ? this.currentFilePath + data.obj_name : this.currentFilePath + '/' + data.obj_name;
    this.fileService.restoreHistorySnapShot(this.currentRepo, commit_id, type, path)
      .subscribe(resps => this.noti.showNotification('success', resps.message), error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  folderRestoreConfirm() {
    jQuery('#restore-folder-confirm-modal').modal('show');
  }

  restoreFolder() {
    jQuery('#restore-folder-confirm-modal').modal('hide');
    this.fileService.restoreFolderSnapshot(this.currentRepo, this.currentCommitID)
      .subscribe(resp => {
        this.noti.showNotification('success', resp.message);
        this.backToRepo();
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  downloadSnapshot(id: string, name: string) {
    this.fileService.getHistoryDownloadLink(this.currentRepo, id)
      .subscribe(resp => window.location.href = `${resp.data.download_link}${name}`, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  openFolder(name: string) {
    this.router.navigate(['files', 'history', 'view', this.currentRepo], {
      queryParams: {
        commit_id: this.resDataCurrentCommit['id'], path: this.resData['path'] + name
      }
    });
  }

  getUserInfo() {
    const token = this.appConfig.GetDataWith('token');
    this.authenService.userInfo()
      .subscribe(resp => {
        console.log(`hahahah`, resp);
        this.isDefaultAvatar = resp.data.is_default_avatar;
        console.log(`hihihih`, this.isDefaultAvatar);

        this.userInfo = new User(resp.data.name, resp.data.email, resp.data.department);
        this.userInfo['avatar_url'] = resp.data.avatar_url;
      }, error => {
      });
  }
  openUserSetting() {
    this.router.navigate(['user', 'profile', this.userInfo.email]);
  }

  openFilePreview(file) {
    this.router.navigate(['repo', this.currentRepo, 'history', 'files'], {
      queryParams: {
        p: `${this.pathData}${file.obj_name}`,
        obj_id: file.obj_id,
        commit_id: this.currentCommitID
      }
    });
  }

  backPage() {
    this.location.back();
  }

  backToRepo() {
    jQuery('#back-repo-modal').modal('hide');
    // this.router.navigate(['folders', this.currentRepo]);
    this.router.navigate(['folders', this.currentRepo]);
  }

  handleBreadcrumbs() {
    const repoBreadcrumbs = this.resData['zipped'].filter((_, index, arr) => index === 0)[0][0];
    const pathBreadcrumbs = this.resData['zipped'].filter((_, index, arr) => index === arr.length - 1 && arr.length > 1);
    if (pathBreadcrumbs.length > 0) {
      this.breadcrumbs = { 'paths': '/' + [...repoBreadcrumbs, ...pathBreadcrumbs[0][1]] + '/' };
    } else {
      this.breadcrumbs = { 'paths': '/' + repoBreadcrumbs + '/' };
    }
  }

  handleNavigateBreadcrumbs(item) {
    const queryParams = { queryParams: { 'commit_id': this.currentCommitID, 'path': item.p } };
    this.router.navigate(['files', 'history', 'view', this.currentRepo], queryParams);
  }

  setErrorImg(index) {
    this.listFilesDisplay[index].imgError = 1;
  }

  changeTable(config, page = this.page) {
    const data = onChangeTable(config, this.listFiles, this.columns, page);
    this.listFilesDisplay = data.rows;
    this.listFilesDisplay.length > 9 ? this.more = true : this.more = false;
  }
}
