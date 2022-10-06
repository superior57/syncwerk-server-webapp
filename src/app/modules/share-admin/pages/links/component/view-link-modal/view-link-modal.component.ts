import {Component, OnInit, Input} from '@angular/core';
import {NotificationService} from '@services/index';

declare var jQuery: any;

@Component({
  selector: 'app-view-link-modal',
  templateUrl: './view-link-modal.component.html',
  styleUrls: ['./view-link-modal.component.scss']
})
export class ViewLinkModalComponent implements OnInit {

  @Input() link;
  @Input() type;

  constructor(private noti: NotificationService) {
  }

  ngOnInit() {
  }

  copyClipboard() {
    this.noti.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }
}
