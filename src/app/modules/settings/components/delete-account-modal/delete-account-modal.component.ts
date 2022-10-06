import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { AuthenticationService, FilesService, NotificationService } from '@services/index';
import { AppConfig } from 'app/app.config';

declare var jQuery: any;

@Component({
  selector: 'app-delete-account-modal',
  templateUrl: './delete-account-modal.component.html',
  styleUrls: ['./delete-account-modal.component.scss']
})
export class DeleteAccountModalComponent implements OnInit {
  @Output()
  DeleteAccountCallBack: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private authenService: AuthenticationService,
    private noti: NotificationService) {
  }

  ngOnInit() {
  }

  closeModal() {
    jQuery('#delete-account-modal').modal('hide');
  }

  deleteAccount() {
    this.closeModal();
    this.authenService.deleteAccount().subscribe(resp => {
      this.DeleteAccountCallBack.emit(resp);
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
    });
  }
}
