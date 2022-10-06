import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GroupsService, NotificationService, MessageService } from 'app/services';
import { Router } from '@angular/router';
import { Type, Action } from '@enum/index.enum';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-dismiss-leave-group-modal',
  templateUrl: './dismiss-leave-group-modal.component.html',
  styleUrls: ['./dismiss-leave-group-modal.component.scss']
})
export class DismissLeaveGroupModalComponent implements OnInit {

  @Input() typeModal: string;
  @Input() groupInfo: { [key: string]: any } = Object;
  @Input() currentEmailLogin: string;
  @Output() DismissLeaveCallback: EventEmitter<any> = new EventEmitter<any>();

  isProcessing = false;
  params: any;

  constructor(
    private groupsService: GroupsService,
    private notification: NotificationService,
    private messageService: MessageService,
    private router: Router,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.params = { groupName: this.groupInfo.name };
  }

  dismissLeaveGroup() {
    this.DismissLeaveCallback.emit(this.typeModal);
    jQuery('#dismiss-leave-group-modal').modal('hide');
  }

  submitDismissLeaveGroup() {
    this.isProcessing = true;
    if (this.typeModal === 'dismiss') {
      this.dismissGroup();
    } else if (this.typeModal === 'leave') {
      this.leaveGroup();
    }
  }

  dismissGroup() {
    this.groupsService.dismissGroup(this.groupInfo.id).subscribe(resps => {
      // this.notification.showNotification('success', resps.message);
      this.notification.showNotification('success', this.translate.instant('GROUP_MANAGEMENT.DISMISS_GROUP_NOTI'));
      this.DismissLeaveCallback.emit({ type_modal: 'dismiss-leave-group', message_success: resps.message });
      this.messageService.send(Type.Side_Menu_Bar_Component, Action.Reload_List_Groups, '');
    }, error => {
      this.isProcessing = false;
      this.notification.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  leaveGroup() {
    this.groupsService.leaveGroup(this.groupInfo.id, this.currentEmailLogin)
      .subscribe(resps => {
        // this.notification.showNotification('success', resps.message);
        this.notification.showNotification('success', this.translate.instant('GROUP_MANAGEMENT.LEFT_GROUP_NOTI'));
        this.DismissLeaveCallback.emit({ type_modal: 'dismiss-leave-group', message_success: resps.message });
        this.messageService.send(Type.Side_Menu_Bar_Component, Action.Reload_List_Groups, '');
      }, error => this.notification.showNotification('danger', JSON.parse(error._body).message));
  }
}
