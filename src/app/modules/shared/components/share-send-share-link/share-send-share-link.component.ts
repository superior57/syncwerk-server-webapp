
import {delay} from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output, Renderer, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { FilesService, NotificationService } from '@services/index';


@Component({
  selector: 'app-share-send-share-link',
  templateUrl: './share-send-share-link.component.html',
  styleUrls: ['./share-send-share-link.component.scss']
})
export class ShareSendShareLinkComponent implements OnInit, OnChanges {
  EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  emailFormControl;
  sendMailData;
  isErrorSend = false;
  @Input() data;
  @Input() type;
  autoFocus = new Subject<boolean>();
  @ViewChild('name') input1ElementRef;
  @Output() closeSend: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private fileService: FilesService,
    private noti: NotificationService,
    private router: Router,
    private _renderer: Renderer,
    private translate: TranslateService
  ) {
    this.autoFocus.pipe(delay(500)).subscribe(data => {
      this._renderer.invokeElementMethod(
        this.input1ElementRef.nativeElement, 'focus', []);
    });
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initComponent();
  }

  initComponent() {
    this.isErrorSend = false;
    this.sendMailData = {
      email: '',
      message: ''
    };
    this.initFormControl();
  }

  initFormControl() {
    this.emailFormControl = new FormControl('', [
      Validators.required,
      // Validators.pattern(this.EMAIL_REGEX)
    ]);
  }

  sendEmail(email, message) {
    const emailList = email.split(',');
    if (emailList.length <= 0) {
      this.isErrorSend = true;
      this.noti.showNotification('danger', this.translate.instant('FORMS.INVALID.EMAIL_LIST_EMPTY'));
      return;
    }
    for (const emailAddress of emailList) {
      if (!this.EMAIL_REGEX.test(emailAddress.trim())) {
        this.isErrorSend = true;
        this.noti.showNotification('danger', this.translate.instant('FORMS.INVALID.EMAIL_LIST'));
        return;
      }
    }
    this.isErrorSend = true;
    if (this.emailFormControl.errors !== null) {
      return;
    }
    const data = {
      token: this.data.token,
      email: email,
      extra_msg: message,
      expire_days: 0,
    };
    if (this.data.expire_date) {
      const createDate = new Date();
      const expireDate = new Date(this.data.expire_date);
      const dateDiff =  Math.abs(expireDate.getTime() - createDate.getTime());
      const dateDiffInDays = Math.ceil(dateDiff / (1000 * 3600 * 24));
      data.expire_days = dateDiffInDays;
    }
    this.handleSendEmail(data);
  }

  handleSendEmail(data) {
    if (this.type === 'download') {
      this.fileService.sendShareLink(data).subscribe(resp => {
        this.handleResultSendMail(resp);
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
      });
    } else {
      this.fileService.sendUploadLink(data).subscribe(resp => {
        this.handleResultSendMail(resp);
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
      });
    }
  }

  handleResultSendMail(resp) {
    const success = resp.data.success;
    const failed = resp.data.failed;
    if (success.length > 0) {
      const message = this.translate.instant('MODALS.SEND_LINK.SEND_SUCCESSFULLY_TO') + success.join(', ');
      this.noti.showNotification('success', message);
    }
    if (failed.length > 0) {
      const list = failed.map(o => o.email).join(', ');
      const message = this.translate.instant('MODALS.SEND_LINK.SEND_FAILED');
      this.noti.showNotification('danger', message);
    }
    this.closeSend.emit('close');
  }

  cancelSendEmail() {
    this.closeSend.emit('close');
  }
}
