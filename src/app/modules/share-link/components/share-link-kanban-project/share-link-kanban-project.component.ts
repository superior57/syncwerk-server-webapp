import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { KanbanService, } from 'app/services';

import { ShareLinkKanbanTaskModalComponent } from '../share-link-kanban-task-modal/share-link-kanban-task-modal.component';

@Component({
  selector: 'app-share-link-kanban-project',
  templateUrl: './share-link-kanban-project.component.html',
  styleUrls: ['./share-link-kanban-project.component.scss']
})
export class ShareLinkKanbanProjectComponent implements OnInit {
  token: string;
  data: any;
  hasAudit: boolean;
  hasPasswordProtected: boolean;
  isPageNotFound = false;
  isListView = false;

  constructor(
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private kanBanService: KanbanService,
  ) {
    this.route.params.subscribe(params => {
      this.token = params['token'];
      this.kanBanService.getShareLink(this.token)
        .subscribe(resps => {
          this.hasAudit = resps.data.share_link_audit;
          if (!resps.data.share_link_audit) { this.checkPasswordProtect(resps.data); }
        }, error => {
          console.error(error);
          const status = error.status;
          switch (status) {
            case 404: this.isPageNotFound = true; break;
            default: break;
          }
        });
    });
  }

  ngOnInit() {
  }

  receiveDataAuditSuccess(data) {
    this.hasAudit = data.share_link_audit;
    this.checkPasswordProtect(data);
  }

  receiveDataPassProtectedSuccess(data) {
    this.checkPasswordProtect(data);
  }

  checkPasswordProtect(data: any) {
    this.hasPasswordProtected = data.password_protected;
    if (!data.password_protected) {
      this.kanBanService.selectedProject = data;
      this.kanBanService.getBoards(data.id).subscribe((res) => {
       this.kanBanService.boards = res.data.kanban_boards;
       this.kanBanService.filteredBoards = res.data.kanban_boards;
      });
    }
  }

  openManageTaskModal(task, boardId) {
    this.kanBanService.selectedTask = task;
    this.modalService.show(ShareLinkKanbanTaskModalComponent, {
      class: 'modal-lg',
      initialState: {
        selectedTask: task,
        boards: this.kanBanService.boards,
        boardId: boardId,
      }
    });
  }

  toggleView(isListView: boolean) {
    return this.isListView = isListView;
  }

}
