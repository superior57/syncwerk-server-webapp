import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService, KanbanService } from 'app/services';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-rename-project-modal',
  templateUrl: './rename-project-modal.component.html',
  styleUrls: ['./rename-project-modal.component.scss']
})
export class RenameProjectModalComponent implements OnInit {
  public selectedProject: any = {};
  public isProcessing = false;
  public projectName = '';
  public selectedFile: any;

  constructor(private kanbanService: KanbanService,
              public bsModalRef: BsModalRef,
              private notify: NotificationService,
              private translate: TranslateService) { }

  ngOnInit() {
    this.projectName = this.selectedProject.project_name;
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  renameProject() {
    this.isProcessing = true;
    this.selectedProject.project_name = this.projectName;
    this.kanbanService.updateProject(this.selectedProject, this.selectedFile).subscribe((res) => {
      this.isProcessing = false;
      this.notify.showNotification('success', this.translate.instant('KANBAN.MODALS.PROJECT_UPDATE_SUCCESS'));
      this.closeModal();
    }, err => {
      this.isProcessing = false;
      this.closeModal();
      this.notify.showNotification('danger', this.translate.instant('KANBAN.MODALS.PROJECT_UPDATE_ERROR'));
    });
  }

  onFileSelected(fileInput: any) {
    this.selectedFile = fileInput.target.files[0];
  }
}
