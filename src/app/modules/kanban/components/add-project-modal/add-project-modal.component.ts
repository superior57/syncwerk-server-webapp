import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, KanbanService } from 'app/services';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-add-project-modal',
  templateUrl: './add-project-modal.component.html',
  styleUrls: ['./add-project-modal.component.scss']
})
export class AddProjectModalComponent implements OnInit {
  public projectName: string;
  public isProcessing = false;
  public selectedFile: any;
  public owner = {};

  constructor(private kanbanService: KanbanService,
              public bsModalRef: BsModalRef,
              private notify: NotificationService,
              private translate: TranslateService,
    ) { }

  ngOnInit() {
  }

  addProject() {
    this.isProcessing = true;
    this.kanbanService.createProject(this.projectName, this.selectedFile).subscribe((res) => {
      this.isProcessing = false;
      this.notify.showNotification('success', this.translate.instant('KANBAN.MODALS.PROJECT_CREATED_SUCCESS'));
      this.closeModal();
    }, err => {
      this.closeModal();
      this.notify.showNotification('danger', this.translate.instant('KANBAN.MODALS.PROJECT_CREATE_ERROR'));
    });
  }

  onFileSelected(fileInput: any) {
    this.selectedFile = fileInput.target.files[0];
  }

  closeModal() {
    this.bsModalRef.hide();
  }
}
