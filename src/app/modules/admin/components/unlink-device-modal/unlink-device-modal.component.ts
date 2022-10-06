import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AdminService, NotificationService } from 'app/services';

@Component({
  selector: 'app-unlink-device-modal',
  templateUrl: './unlink-device-modal.component.html',
  styleUrls: ['./unlink-device-modal.component.scss']
})
export class UnlinkDeviceModalComponent implements OnInit {

  @Input() dataDevices: { [key: string]: any } = Object;
  @Output() removed = new EventEmitter;

  isProcessing = false;
  isWipe = false;
  params: any;

  constructor(
    private adminService: AdminService,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
  }

  submitUnlink() {
    this.isProcessing = true;
    this.handleUnlink();
  }

  handleUnlink() {
    this.adminService.deleteSysAdminDevices(this.dataDevices.platform, this.dataDevices.device_id, this.dataDevices.user, this.isWipe)
      .subscribe(resps => {
        this.removed.emit();
        this.notification.showNotification('success', resps.message);
      }, error => {
        this.notification.showNotification('danger', JSON.parse(error._body).message);
        this.isProcessing = false;
      });
  }

  remoteWipe(e) {
    this.isWipe = e.target.checked;
  }
}
