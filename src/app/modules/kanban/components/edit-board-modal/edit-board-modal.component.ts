import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, KanbanService } from 'app/services';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-edit-board-modal',
  templateUrl: './edit-board-modal.component.html',
  styleUrls: ['./edit-board-modal.component.scss']
})
export class EditBoardModalComponent implements OnInit {
  public selectedBoard: any = {};
  public isProcessing = false;
  public boardName = '';

  constructor(private kanbanService: KanbanService,
              public bsModalRef: BsModalRef,
              private notify: NotificationService,
              private translate: TranslateService) { }

  ngOnInit() {
    this.boardName = this.selectedBoard.board_name;
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  renameBoard() {
    if (!this.boardName || this.selectedBoard.board_name === this.boardName) {
      return;
    }
    this.isProcessing = true;
    this.selectedBoard.board_name = this.boardName;
    this.kanbanService.renameBoard(this.selectedBoard).subscribe((res) => {
      this.isProcessing = false;
      this.notify.showNotification('success', this.translate.instant('KANBAN.MODALS.BOARD_UPDATE_SUCCESS'));
      this.closeModal();
    }, err => {
      this.isProcessing = false;
      this.closeModal();
      this.notify.showNotification('danger', this.translate.instant('KANBAN.MODALS.PROJECT_UPDATE_ERROR'));
    });
  }
}
