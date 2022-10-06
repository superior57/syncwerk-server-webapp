import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ng2TreeSettings, TreeModel, NodeEvent, Tree } from 'ng2-tree';

import { FilesService, NotificationService, MessageService } from '@services/index';
import { Type, Action } from '@enum/index.enum';

import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;
declare const alertify: any;

@Component({
  selector: 'app-copy-move-modal',
  templateUrl: './copy-move-modal.component.html',
  styleUrls: ['./copy-move-modal.component.scss']
})
export class CopyMoveModalComponent implements OnInit {

  public settings: Ng2TreeSettings = {
    rootIsVisible: false,
  };

  private subscription: Subscription;
  @Input() dataCopyMove: any;
  @Input() parentPath: string;
  @Input() typeOperation: string;
  @Output() onCopyMovedSuccess: EventEmitter<any> = new EventEmitter<any>();

  currentRepo: string;
  selectedRepoId: string;
  nodeSelectedPath: string;
  hasError;
  errorMessage: string;
  isProcessing = false;

  public currentFolder: TreeModel = {
    id: 1,
    value: 'Root',
    settings: {
      cssClasses: {
        expanded: 'fal fa-caret-down color-black',
        collapsed: 'fal fa-caret-right color-black',
        empty: 'fal fa-caret-right disabled',
        leaf: 'fa'
      },
      templates: {
        node: '<i class="fas fa-folder"></i>',
        leaf: '<i class="fal fa-file-o"></i>'
      },
      rightMenu: false,
    },
    children: [
      // {
      //   id: 2,
      //   value: 'Current folder',
      //   children: []
      // },
      // {
      //   id: 3,
      //   value: 'Other folder',
      //   children: [],
      // },
    ],
  };

  private lastNodeIdOfCurrentLib = 2;

  @ViewChild('treeCurrentFolder') public treeFolder;

  constructor(
    private filesService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
  ) {
  }

  private static logEvent(e: NodeEvent, message: string): void {
  }

  ngOnInit() {
    console.log(this.dataCopyMove);
    const paths = this.router.url.split('/')
      .filter(data => (data.length > 0))
      .filter(data => data !== 'folders')
      .filter(data => data !== 'files');
    this.currentRepo = paths[0];
    this.createTreeCurrentLibbrary(this.currentRepo);
    this.createTreeOtherFolder(this.currentRepo);
  }

  createTreeCurrentLibbrary(repoId: string) {
    this.filesService.getDetailsRepos(repoId)
      .subscribe(resp => {
        this.treeFolder.getControllerByNodeId(1).setChildren([]);
        const childNodeId = this.createTreeRepo(repoId, resp.data.name, 1);
        this.createNodeDirectory(childNodeId, resp.data.id, '/');
      });
  }

  createTreeRepo(repoId: string, name: string, idTypeLib: number, resetChild: boolean = true) {
    const treeNodeController = this.treeFolder.getControllerByNodeId(idTypeLib);
    if (resetChild) { treeNodeController.setChildren([]); }
    const newNodeRepo: TreeModel = {
      id: ++this.lastNodeIdOfCurrentLib,
      value: name.length >= 20 ? name.slice(0, 19) + '...' : name,
      children: []
    };
    newNodeRepo['parent_dir'] = '';
    newNodeRepo['repo_id'] = repoId;
    treeNodeController.addChild(newNodeRepo);
    return newNodeRepo.id;
  }

  createNodeDirectory(selectedNodeId: number | string, repoId: string, path: string) {
    this.filesService.getDirectoryCopy(repoId, path, '&dir_only=true')
      .subscribe(resp => {
        this.selectedRepoId = repoId;
        if (resp.data.length > 0) {
          for (const value of resp.data) {
            this.handleAddChild(value.name, value.parent_dir, repoId, selectedNodeId);
          }
        }
      }, error => console.error(error));
  }

  async createTreeOtherFolder(repoId: string) {
    try {
      const filterMineRepo = this.filterListRepo(await this.getMineRepo(), repoId);
      const filterSharedRepo = this.filterListRepo(await this.getSharedRepo(), repoId);
      const fullFolder = [...filterMineRepo, ...filterSharedRepo];
      fullFolder.forEach((value) => {
        this.createTreeRepo(value.id, value.name, 1, false);
      });
    } catch (err) { console.error(err); }
  }

  getMineRepo() {
    return new Promise((resolve, reject) => this.filesService.getRepo('mine')
      .subscribe(resps => resolve(resps.data), error => console.error(error)));
  }

  getSharedRepo() {
    return new Promise((resolve, reject) => this.filesService.getRepo('shared')
      .subscribe(resps => resolve(resps.data), error => console.error(error)));
  }

  filterListRepo(objRepo: any, repoId: string) {
    const objArr = Object.keys(objRepo).map(key => objRepo[key]);
    const completeFilter = objArr
      .filter(obj => obj.permission !== 'r')
      .filter(obj => !obj.encrypted)
      .filter(obj => obj.id !== repoId);
    return completeFilter;
  }

  public onNodeSelected(e: NodeEvent): void {
    console.log(e);
    // CopyMoveModalComponent.logEvent(e, 'Selected');
    if (e.node.id !== 1) {
      this.selectedRepoId = e.node.node['repo_id'];
      this.treeFolder.getControllerByNodeId(e.node.id).setChildren([]);
      this.nodeSelectedPath = this.handleNodePath(e.node.node['parent_dir'], e.node.node['path']);
      this.createNodeDirectory(e.node.id, e.node.node['repo_id'], this.nodeSelectedPath);
    }
  }

  handleNodePath(parentDir: string, name: string) {
    let handleNodePath = '';
    if (parentDir === '' || parentDir === undefined) {
      handleNodePath = '/';
    } else if (parentDir === '/') {
      handleNodePath = '/' + name + '/';
    } else {
      handleNodePath = parentDir + name + '/';
    }
    return handleNodePath;
  }

  public onNodeExpanded(e: NodeEvent): void {
    // CopyMoveModalComponent.logEvent(e, 'Expanded');
  }

  public onNodeCollapsed(e: NodeEvent): void {
    // CopyMoveModalComponent.logEvent(e, 'Collapsed');
  }

  addChildFFS(id: number | string, newNode: TreeModel) {
    const treeController = this.treeFolder.getControllerByNodeId(id);
    if (treeController) {
      treeController.addChild(newNode);
    } else {
    }
  }

  handleAddChild(childName: string, parentDir: string, repoId: string, selectedNodeId: number | string) {
    const childId = ++this.lastNodeIdOfCurrentLib;
    const newNode = {
      id: childId,
      value: childName.length >= 20 ? childName.slice(0, 19) + '...' : childName,
      children: [],
      path: childName,
    };
    newNode['parent_dir'] = parentDir;
    newNode['repo_id'] = repoId;
    this.addChildFFS(selectedNodeId, newNode);
  }

  handleDataCopyMove(src_dirent_name: string, dirent_type: string) {
    const data = {
      src_repo_id: this.currentRepo,
      src_parent_dir: this.parentPath,
      src_dirent_name: src_dirent_name,
      dst_repo_id: this.selectedRepoId,
      dst_parent_dir: this.nodeSelectedPath,
      operation: this.typeOperation,
      dirent_type: dirent_type,
    };
    return data;
  }

  async submitCopyFileFolder() {
    this.errorMessage = '';
    if (this.dataCopyMove.length) {
      await this.handleSelectedCopyMove();
      if (this.errorMessage) {
        console.log(this.errorMessage);
        return;
      }
      if (!this.hasError) { this.handleNotificationSuccess(); }
    } else {
      if (!this.handleDataCopyMove(this.dataCopyMove.name, this.dataCopyMove.type).dst_parent_dir) {
        return this.errorMessage = 'Please choose a valid directory.';
      }
      this.postCopyMove();
    }
  }

  handleNotificationSuccess(messageSuccess: string = null) {
    if (this.typeOperation === 'copy') {
      this.noti.showNotification('success', messageSuccess === null ? this.translate.instant('TOOLTIPS.COPY_SUCCESS') : messageSuccess);
      this.onCopyMovedSuccess.emit();
    } else {
      this.noti.showNotification('success', messageSuccess === null ? this.translate.instant('TOOLTIPS.MOVE_SUCCESS') : messageSuccess);
      this.onCopyMovedSuccess.emit();
    }
  }

  async handleSelectedCopyMove() {
    try {
      for (const item of this.dataCopyMove) {
        if (!this.handleDataCopyMove(item.name, item.type).dst_parent_dir) {
          return this.errorMessage = 'Please choose a valid directory.';
        }
        this.hasError = await this.postCopyMoveSelected(this.handleDataCopyMove(item.name, item.type));
        if (this.hasError) { return; }
      }
    } catch (error) { console.error(error); }
  }

  postCopyMove() {
    this.isProcessing = true;
    this.filesService.copyOrMoveFileFolder(this.handleDataCopyMove(this.dataCopyMove.name, this.dataCopyMove.type))
      .subscribe(resps => {
        this.handleNotificationSuccess(resps.message);

      }, error => {
        this.isProcessing = false;
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  postCopyMoveSelected(data: any) {
    return new Promise((resolve, reject) => {
      this.filesService.copyOrMoveFileFolder(data)
        .subscribe(resps => {
          return resolve(false);
        }, error => {
          this.isProcessing = false;
          this.noti.showNotification('danger', JSON.parse(error._body).message);
          console.error(error);
          return resolve(true);
        });
    });
  }
}
