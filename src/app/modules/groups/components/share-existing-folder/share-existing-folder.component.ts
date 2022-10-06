import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NotificationService, AdminService, FilesService } from 'app/services';

import { Ng2TreeSettings, TreeModel, NodeEvent, Tree } from 'ng2-tree';

@Component({
  selector: 'app-share-existing-folder',
  templateUrl: './share-existing-folder.component.html',
  styleUrls: ['./share-existing-folder.component.scss']
})
export class ShareExistingFolderComponent implements OnInit {

  public settings: Ng2TreeSettings = {
    rootIsVisible: false,
  };

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

  currentRepo: string;
  selectedRepoId: string;
  nodeSelectedPath: string;
  permission = 'rw';
  Path = '/';
  folderNameDisplay: any;

  groupInfo: any = {};

  private lastNodeIdOfCurrentLib = 2;
  @ViewChild('treeCurrentFolder') public treeFolder;

  constructor(
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
  ) { }

  ngOnInit() {
    console.log('goup info', this.groupInfo);
    const paths = this.router.url.split('/')
      .filter(data => (data.length > 0))
      .filter(data => data !== 'manage')
      .filter(data => data !== 'groups')
      .filter(data => data !== 'files');
    this.currentRepo = paths[0];
    this.createTreeOtherFolder(this.currentRepo);
  }

  onCloseModal() {
    this.bsModalRef.hide();
  }

  async onShareExistingFolder() {
    const body = {
      share_type: 'group',
      permission: this.permission,
      group_name: this.groupInfo.name, // id current folder
    };

    this.fileService.shareFolderToGroup(this.selectedRepoId, body, this.Path).subscribe(resps => {
      if (resps.data.success.length > 0) {
        this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.SHARE_TO_GROUP_SUCCESS');
      } else {
      }
      this.bsModalRef.hide();
    });
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


  getMineRepo() {
    return new Promise((resolve, reject) => this.fileService.getRepo('mine')
      .subscribe(resps => resolve(resps.data), error => console.error(error)));
  }

  getSharedRepo() {
    return new Promise((resolve, reject) => this.fileService.getRepo('shared')
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
    console.log(`event`, e);
    // CopyMoveModalComponent.logEvent(e, 'Selected');
    if (e.node.id !== 1) {
      this.selectedRepoId = e.node.node['repo_id'];
      this.folderNameDisplay = e.node.node['value'];
      console.log(`folderNameDisadasfasd`, this.folderNameDisplay);

      this.Path = e.node.node['parent_dir'] + e.node.node['path'];
      if (this.Path === 'undefined') {
        this.Path = '/';
      }
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

  createNodeDirectory(selectedNodeId: number | string, repoId: string, path: string) {
    this.fileService.getDirectoryCopy(repoId, path, '&dir_only=true')
      .subscribe(resp => {
        this.selectedRepoId = repoId;
        if (resp.data.length > 0) {
          for (const value of resp.data) {
            this.handleAddChild(value.name, value.parent_dir, repoId, selectedNodeId);
          }
        }
      }, error => console.error(error));
  }

  addChildFFS(id: number | string, newNode: TreeModel) {
    const treeController = this.treeFolder.getControllerByNodeId(id);
    if (treeController) {
      treeController.addChild(newNode);
    } else {
    }
  }

  public onNodeExpanded(e: NodeEvent): void {
  }

  public onNodeCollapsed(e: NodeEvent): void {
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



}
