import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, KanbanService } from 'app/services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-remove-project-modal',
  templateUrl: './remove-project-modal.component.html',
  styleUrls: ['./remove-project-modal.component.scss']
})
export class RemoveProjectModalComponent implements OnInit {
  public isProcessing = false;
  selectedProject: any = {};
  isOwner: boolean;
  constructor(public bsModalRef: BsModalRef,
              private kanbanService: KanbanService,
              private notify: NotificationService,
              private translate: TranslateService,
              private modalService: BsModalService

              ) { }

  ngOnInit() {
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  deleteProject() {
    this.isProcessing = true;
    this.kanbanService.deleteProject(this.selectedProject.id).subscribe(resp => {
      this.isProcessing = false;
      this.notify.showNotification('success', this.translate.instant('KANBAN.MODALS.PROJECT_DELETED'));
      this.bsModalRef.content.onClose.next(true);
      this.closeModal();
    }, err => {
      this.isProcessing = false;
      this.notify.showNotification('danger',  this.translate.instant('KANBAN.MODALS.PROJECT_DELETE_ERROR'));
      this.closeModal();
    });
  }
}
