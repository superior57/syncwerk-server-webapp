import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select2OptionData } from 'ng2-select2';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie';

import { environment } from 'environments/environment';
import { getTypeRepoFromRoute } from 'app/app.helpers';
import { Action, Type } from '@enum/index.enum';
import { FilesService, MessageService, NotificationService } from '@services/index';
import { promise } from 'protractor';

declare var jQuery: any;
@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.scss']
})
export class TrashComponent implements OnInit {

  trashData: any = {};
  trashItemsForDisplay = [];
  trashItemsFromAPI = [];
  listTrashDatas: Array<any> = [];
  trashDay = '3';
  repoId: string;
  // breadcrumbs = {
  //   paths: ''
  // };
  nameTrashGroup = '';
  breadcrumbs = [];
  nameTrash: string;
  typeRepo = '';
  isListView = false;
  isRootTrash: boolean;
  isRepo: boolean;
  dirPath: string;
  isProcessing = false;
  queryParams = {
    'commit_id': null,
    'base_dir': null,
    'dir_path': null,
    'p': null,
  };
  params: any;
  pagination = {
    itemsPerPage: 30,
    page: 1,
  };

  maxSize = 5;

  imgTypeFormat = ['jpg', 'jpeg', 'png', 'gif'];

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
    private location: Location,
    private cookieService: CookieService,
    private translate: TranslateService
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.repoId = params.repoId;
    });
    this.activatedRoute.queryParamMap.subscribe(qpm => {
      this.isProcessing = true;
      this.trashData = undefined;
      this.initDataSelect();
      if (qpm.keys.length <= 0) {
        this.getTrashMore(this.repoId);
      } else {
        if (qpm.has('commit_id')) {
          this.nameTrash = qpm.get('p') !== '/' ? this.getNameParentInPath(qpm.get('p')) : null;
          this.dirPath = qpm.get('dir_path');
          this.prelicationQueryParamMap(qpm);
          this.isRepo = qpm.get('dir_path') === '/';
          if (this.isRepo) {
            this.getTrashRepo(qpm.get('commit_id'), qpm.get('base_dir'), qpm.get('p'));
          } else {
            this.getTrashDir(qpm.get('commit_id'), qpm.get('base_dir'), qpm.get('p'), qpm.get('dir_path'));
          }
        } else {
          this.getTrashMore(this.repoId, qpm.get('path'));
        }
      }
    });
  }

  ngOnInit() {
    this.typeRepo = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
    this.isListView = this.cookieService.get('syc_view_mode') === 'list_view';
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  initDataSelect() {
    setTimeout(() => {
      this.exampleData = [
        { id: '3', text: this.translate.instant('TRASH.TIME.THREE_DAYS') },
        { id: '7', text: this.translate.instant('TRASH.TIME.ONE_WEEK') },
        { id: '30', text: this.translate.instant('TRASH.TIME.ONE_MONTH') },
        { id: '-1', text: this.translate.instant('TRASH.TIME.ALL') }
      ];
    }, 300);

  }

  prelicationQueryParamMap(queryParamMap: any) {
    this.queryParams.commit_id = queryParamMap.get('commit_id');
    this.queryParams.base_dir = queryParamMap.get('base_dir');
    this.queryParams.dir_path = queryParamMap.get('dir_path');
    this.queryParams.p = queryParamMap.get('p');
  }

  getTrash(): Promise<any> {
    return new Promise((resolve) => {
      this.fileService.getTrash(this.repoId).subscribe(resps => {
        this.listTrashDatas = resps.data;
        this.updateListTrash();
        resolve();
      });
    });
  }
  updateListTrash() {
    this.trashItemsForDisplay = this.listTrashDatas;
  }
  async onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.trashItemsForDisplay.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    await this.getTrash();
    this.handlePagination();
  }



  getNameParentInPath(path: string) {
    return path.split('/').filter((_, index, item) => index === item.length - 1)[0];
  }

  getTrashMore(repoId: string, path: string = null) {
    this.fileService.getTrash(repoId, path ? path : null).subscribe(resps => {
      this.isRepo = resps.data.trash.dir_path === '/';
      this.isRootTrash = resps.data.trash.show_recycle_root;
      this.nameTrash = path ? path === '/' ? resps.data.trash.repo.name : this.getNameParentInPath(path) : resps.data.trash.repo.name;
      this.trashData = resps.data;
      this.trashItemsFromAPI = resps.data.trash.dir_entries;
      for (const type of this.trashItemsFromAPI) {
        const getFormatOfFile = /[^.]+$/.exec(type.name);
        if (this.imgTypeFormat.indexOf(getFormatOfFile[0]) !== -1) {
          // this value = -1 but at this time can't get a thumbnail so I set = 1 to take an icons
          type.imgError = 1;
        } else {
          type.imgError = 1;
        }
      }
      this.nameTrashGroup = resps.data.trash.repo.name;
      this.handlePagination();
      // this.trashItemsForDisplay = Object.assign(this.trashItemsFromAPI);
      this.dirPath = resps.data.trash.dir_path;
      this.handleBreadcrumbs();
      this.isProcessing = false;
    }, error => {
      console.error(error);
      this.noti.showNotification('danger', JSON.parse(error._body).message);
      this.isProcessing = false;
    });
  }

  getTrashRepo(commitId: string, base: string, p: string) {
    this.fileService.getTrashRepo(this.repoId, commitId, base, p)
      .subscribe(resps => {
        this.isRootTrash = resps.data.show_recycle_root;
        this.trashData = resps.data;
        this.trashItemsFromAPI = resps.data.trash ? resps.data.trash.dir_entries : resps.data.dir_entries;
        this.trashItemsForDisplay = Object.assign(this.trashItemsFromAPI);
        for (const type of this.trashItemsForDisplay) {
          const getFormatOfFile = /[^.]+$/.exec(type.name);
          if (this.imgTypeFormat.indexOf(getFormatOfFile[0]) !== -1) {
            // this value = -1 but at this time can't get a thumbnail so I set = 1 to take an icons
            type.imgError = 1;
          } else {
            type.imgError = 1;
          }
        }
        if (this.queryParams.p === '/') { this.nameTrash = resps.data.repo.name; }
        this.handleBreadcrumbs();
        this.isProcessing = false;
      }, error => {
        console.error(error);
        this.isProcessing = false;
      }
      );
  }

  getTrashDir(commitId: string, base: string, p: string, dirPath: string) {
    this.fileService.getTrashDir(this.repoId, commitId, base, p, dirPath)
      .subscribe(resps => {
        this.isRootTrash = resps.data.show_recycle_root;
        this.trashData = resps.data;
        this.trashItemsFromAPI = resps.data.dir_entries;
        this.trashItemsForDisplay = Object.assign(this.trashItemsFromAPI);
        console.log('trash data', this.trashItemsForDisplay);
        if (this.queryParams.p === '/') { this.nameTrash = resps.data.repo.name; }
        this.handleBreadcrumbs();
        this.isProcessing = false;
      }, error => {
        console.error(error);
        this.isProcessing = false;
      });
  }

  openItemFolder(name: string, commitId: string = null, baseDir: string = null) {
    if (this.isRootTrash) {
      this.router.navigate(['files', 'trash', this.repoId], { queryParams: this.queryParamsFolder(name, commitId, baseDir) });
    } else {
      this.router.navigate(['files', 'trash', this.repoId], { queryParams: this.queryParamsFolder(name) });
    }
  }

  openItemFile(name: string, objId: string, commitId: string = null, baseDir: string = null) {
    if (this.isRootTrash) {
      this.router.navigate(['repo', this.repoId, 'trash', 'files'], { queryParams: this.queryParamsFile(name, objId, commitId, baseDir) });
    } else {
      this.router.navigate(['repo', this.repoId, 'trash', 'files'], { queryParams: this.queryParamsFile(name, objId) });
    }
  }

  onSearchFilterChange(data) {
    const searchQuery = data.target.value.toLowerCase();
    if (data.target.value.trim() === '') {
      this.trashItemsForDisplay = Object.assign(this.trashItemsFromAPI);
    } else {
      this.trashItemsForDisplay = this.trashItemsFromAPI.filter(ele => ele.name.toLowerCase().includes(searchQuery));
    }
  }

  queryParamsFolder(name: string, commitId: string = null, baseDir: string = null) {
    const queryParams = {
      'commit_id': this.isRootTrash ? commitId : this.trashData.commit_id,
      'base_dir': this.isRootTrash ? baseDir : this.trashData.basedir,
      'dir_path': this.dirPath,
      'p': this.isRootTrash ? `/${name}` : this.trashData.path + name
    };
    return queryParams;
  }

  queryParamsFile(name: string, objId: string, commitId: string = null, baseDir: string = null) {
    const queryParams = {
      'obj_id': objId,
      'commit_id': this.isRootTrash ? commitId : this.trashData.commit_id,
      'base': this.isRootTrash ? baseDir : this.trashData.basedir,
      'p': this.isRootTrash ? `/${name}` : this.trashData.path + name
    };
    return queryParams;
  }

  restoreTrash(itemType: string, itemCommitId: string, path: string) {
    this.fileService.restoreTrash(this.repoId, itemType, itemCommitId, path)
      .subscribe(resps => {
        this.handleReloadData();
        this.noti.showNotification('success', resps.message);
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  handleReloadData() {
    this.activatedRoute.queryParamMap.subscribe(queryParamMap => {
      if (queryParamMap.keys.length <= 0) {
        this.getTrashMore(this.repoId);
      } else {
        if (queryParamMap.has('commit_id')) {
          if (queryParamMap.get('dir_path') === '/') {
            this.getTrashRepo(queryParamMap.get('commit_id'), queryParamMap.get('base_dir'), queryParamMap.get('p'));
          } else {
            this.getTrashDir(
              queryParamMap.get('commit_id'), queryParamMap.get('base_dir'),
              queryParamMap.get('p'), queryParamMap.get('dir_path')
            );
          }
        } else {
          this.getTrashMore(this.repoId, queryParamMap.get('path'));
        }
      }
    });
  }

  changedSettingPermission(data: { value: string }) {
    this.trashDay = data.value;
  }

  openTrashModal() {
    this.trashDay = '3';
    jQuery('#modal-clean-trash').modal('show');
  }

  closeModal() {
    jQuery('#modal-clean-trash').modal('hide');
  }

  cleanTrash(day: string) {
    this.closeModal();
    this.fileService.removeTrash(this.repoId, day)
      .subscribe(resps => {
        this.handleReloadData();
        this.noti.showNotification('success', resps.message);
      }, error => {
        console.error(error);
        this.noti.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  backPage() {
    this.location.back();
  }

  handleBreadcrumbs() {
    this.breadcrumbs = [];
    this.breadcrumbs.push({ name: this.translate.instant('TRASH.TITLE'), path: ['files', 'trash', this.repoId] });
    this.breadcrumbs.push({ name: this.nameTrashGroup });
  }

  setErrorImg(type, index) {
    if (type === 'root') {
      this.trashData.trash.dir_entries[index].imgError = 1;
    } else {
      this.trashData.dir_entries[index].imgError = 1;
    }
  }

  goBack() {
    this.location.back();
  }
  async pageChanged(paginationData) {
    this.pagination = paginationData;
    await this.getTrash();
    this.handlePagination();
  }

  handlePagination() {
    const startItem = (this.pagination.page - 1) * this.pagination.itemsPerPage;
    const endItem = this.pagination.page * this.pagination.itemsPerPage;
    this.trashItemsForDisplay = this.trashItemsFromAPI.slice(startItem, endItem);
  }
}
