import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AdminService, NotificationService } from 'app/services';

declare const jQuery: any;

@Component({
  selector: 'app-modal-folders-all-delete-item',
  templateUrl: './modal-folders-all-delete-item.component.html',
  styleUrls: ['./modal-folders-all-delete-item.component.scss']
})
export class ModalFoldersAllDeleteItemComponent implements OnInit {

  @Input() dataFolder: { [key: string]: any } = Object;
  @Output() deleted = new EventEmitter;

  isProcessing = false;
  params: any;

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
    this.params = {
      folderName: this.dataFolder.name.length > 15 ? `${this.dataFolder.name.slice(0, 15)}...` : this.dataFolder.name,
    };
  }

  submitDeleteFolder() {
    this.isProcessing = true;
    this.adminService.deleteAdminFolder(this.dataFolder.id).subscribe(resps => {
      this.deleted.emit(resps.message);
    }, error => {
      this.notification.showNotification('danger', JSON.parse(error._body).message);
      this.isProcessing = false;
    });
  }
}
