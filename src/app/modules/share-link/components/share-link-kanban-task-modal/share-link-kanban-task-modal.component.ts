import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap';

import { KanbanService } from 'app/services';

@Component({
  selector: 'app-share-link-kanban-task-modal',
  templateUrl: './share-link-kanban-task-modal.component.html',
  styleUrls: ['./share-link-kanban-task-modal.component.scss']
})
export class ShareLinkKanbanTaskModalComponent implements OnInit {
  public loadingAttachments = false;

  constructor(
    public bsModalRef: BsModalRef,
    public kanbanService: KanbanService,
  ) { }

  ngOnInit() {
    this.kanbanService.getAttachments(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.loadingAttachments = false;
      this.kanbanService.selectedTask.attachments = res.data.kanban_attachs;
    });
    this.kanbanService.getTodos(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.selectedTask.todos = res.data.kanban_sub_tasks;
    });
    this.kanbanService.getComments(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.selectedTask.comments = res.data.kanban_comments;
    });
    this.kanbanService.getHistory(this.kanbanService.selectedTask.id).subscribe((res) => {
      this.kanbanService.selectedTask.history = res.data.kanban_history;
    });
  }

  closeModal() {
    this.bsModalRef.hide();
  }

}
