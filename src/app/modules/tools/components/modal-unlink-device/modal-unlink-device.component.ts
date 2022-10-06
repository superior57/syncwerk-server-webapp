import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OtherService, NotificationService } from 'app/services';
import { TranslateService } from '@ngx-translate/core';

declare const jQuery: any;

@Component({
  selector: 'app-modal-unlink-device',
  templateUrl: './modal-unlink-device.component.html',
  styleUrls: ['./modal-unlink-device.component.scss']
})
export class ModalUnlinkDeviceComponent implements OnInit {
  @Input() public device: any;
  @Output() unlinked = new EventEmitter;

  isProcessing = false;
  isWipe = false;
  params: any;
  isSelectWipe = false;
  deviceName: string;
  allowToSubmit = true;

  constructor(
    private otherService: OtherService,
    private translate: TranslateService,
    private notify: NotificationService
  ) { }

  ngOnInit() { }

  submitUnlinkDevice() {
    if (this.allowToSubmit === false) {
      return;
    }
    this.isProcessing = true;
    this.otherService.unlinkDevice(this.device.device_id, this.device.platform, this.isWipe)
      .subscribe(resp => {
        this.unlinked.emit();
        this.translate.get('LINKED_DEVICE.UNLINK_SUCCESS', { device_name: this.device.device_name }).subscribe(mes => {
          this.notify.showNotification('success', mes);
          this.isProcessing = false;
          jQuery('#modal-unlink-device').modal('hide');
        });
      }, err => {
        this.translate.get('LINKED_DEVICE.UNLINK_FAILED').subscribe(mes => {
          this.notify.showNotification('danger', mes);
          this.isProcessing = false;
        });
      });
  }

  remoteWipe(e) {
    this.isWipe = e.target.checked;
    this.isSelectWipe = e.target.checked;
    if (e.target.checked) {
      this.allowToSubmit = false;
    } else {
      this.allowToSubmit = true;
    }
  }

  onChangeDeviceName(newName) {
    this.allowToSubmit = (this.device.device_name === newName);
  }

  copy() {
    this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.DEVICE_NAME_BEEN_COPIED_TO_CLIPBOARD');
  }
}
