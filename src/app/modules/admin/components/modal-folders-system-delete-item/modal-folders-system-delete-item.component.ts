import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AdminService, NotificationService } from 'app/services';

declare const jQuery: any;

@Component({
  selector: 'app-modal-folders-system-delete-item',
  templateUrl: './modal-folders-system-delete-item.component.html',
  styleUrls: ['./modal-folders-system-delete-item.component.scss']
})
export class ModalFoldersSystemDeleteItemComponent implements OnInit {

  @Input() dataItem: any;
  @Output() deleted = new EventEmitter;

  isProcessing = false;

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
  }

  submitDelete() {
    this.isProcessing = true;
    this.adminService.deleteFileFolderInFoldersSys(this.dataItem.repo_id, this.dataItem.path)
      .subscribe(resps => {
        this.deleted.emit(resps.message);
      }, error => {
        this.isProcessing = false;
        this.notification.showNotification('danger', JSON.parse(error._body).message);
      });
  }
}
