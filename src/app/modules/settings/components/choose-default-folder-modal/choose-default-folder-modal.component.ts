import { Component, OnChanges, SimpleChanges, SimpleChange, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { Ng2TreeSettings, TreeModel, NodeEvent, Tree } from 'ng2-tree';
import { NotificationService, AuthenticationService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;
declare const alertify: any;

@Component({
  selector: 'app-choose-default-folder-modal',
  templateUrl: './choose-default-folder-modal.component.html',
  styleUrls: ['./choose-default-folder-modal.component.scss']
})
export class ChooseDefaultFolderModalComponent implements OnInit, OnChanges {
  public settings: Ng2TreeSettings = {
    rootIsVisible: false,
  };

  @Input() ownedFolders: any;
  @Output() defaultFolderCallback: EventEmitter<any> = new EventEmitter<any>();
  selectedRepo;

  public folders: TreeModel;

  private lastNodeId = 1;

  @ViewChild('treeFolders') public treeFolders;

  constructor(
    private authenticationService: AuthenticationService,
    private noti: NotificationService,
    private translateSerivce: TranslateService
  ) {
    this.folders = {
      id: 1,
      value: this.translateSerivce.instant('SETTINGS.DEFAULT_FOLDER.NAME'),
      settings: {
        cssClasses: {
          expanded: 'fal fa-caret-down color-black',
          collapsed: 'fal fa-caret-right color-gray',
          empty: 'fal fa-caret-right disabled',
          leaf: 'fa'
        },
        templates: {
          node: '<i class="fas fa-folder"></i>',
          leaf: '<i class="fas fa-folder"></i>'
        },
        rightMenu: false,
      },
      children: [],
    };
  }

  private static logEvent(e: NodeEvent, message: string): void {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const rootId = 1;
    for (const lib of this.ownedFolders) {
      this.appendFolder(lib.id, lib.name, rootId);
    }
  }

  appendFolder(repoId: string, name: string, parentId: number) {
    const treeNodeController = this.treeFolders.getControllerByNodeId(parentId);
    const newNodeRepo: TreeModel = {
      id: ++this.lastNodeId,
      value: name
    };
    newNodeRepo['repo_id'] = repoId;
    treeNodeController.addChild(newNodeRepo);
  }

  onNodeSelected(e: NodeEvent) {
    const seletedNodeId = e.node.node.id;
    if (seletedNodeId !== 1) {
      this.selectedRepo = {
        id: e.node.node['repo_id'],
        name: e.node.node.value
      };
    } else {
      this.selectedRepo = undefined;
    }
  }

  submitDefaultFolder() {
    if (this.selectedRepo === undefined) {
      this.noti.showNotification('danger', this.translateSerivce.instant('SETTINGS.DEFAULT_FOLDER.PLEASE_SELECT_A_FOLDER'));
      return;
    }
    this.authenticationService.changeDefaultFolder(this.selectedRepo.id)
      .subscribe(resp => {
        this.noti.showNotification('success', resp.message);
        this.defaultFolderCallback.emit({ newDefaultFolder: this.selectedRepo });
        jQuery('#choose-default-folder-modal').modal('hide');
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        console.error(error);
      });
  }

  closeModal() {
    jQuery('#choose-default-folder-modal').modal('hide');
  }
}
