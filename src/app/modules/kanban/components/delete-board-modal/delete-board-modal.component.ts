import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, KanbanService } from 'app/services';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-delete-board-modal',
  templateUrl: './delete-board-modal.component.html',
  styleUrls: ['./delete-board-modal.component.scss']
})
export class DeleteBoardModalComponent implements OnInit {
  public selectedBoard: any = {};
  public isProcessing = false;

  constructor(public bsModalRef: BsModalRef,
              private kanbanService: KanbanService,
              private notify: NotificationService,
              private translate: TranslateService) { }

  ngOnInit() {
  }
  closeModal() {
    this.bsModalRef.hide();
  }

  deleteBoard() {
    this.isProcessing = true;
    this.kanbanService.deleteBoard(this.selectedBoard.id).subscribe(resp => {
      this.isProcessing = false;
      this.notify.showNotification('success', this.translate.instant('KANBAN.MODALS.BOARD_DELETE_SUCCESS'));
      this.bsModalRef.content.onClose.next(true);
      this.closeModal();
    }, err => {
      this.isProcessing = false;
      this.notify.showNotification('danger',  this.translate.instant('KANBAN.MODALS.BOARD_DELETE_ERROR'));
      this.closeModal();
    });
  }
}
