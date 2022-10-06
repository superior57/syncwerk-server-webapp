import { Component, OnInit, AfterViewInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NotificationService, ShareLinkService, I18nService, AdminService, NonAuthenticationService } from '@services/index';
import { ActivatedRoute } from '@angular/router';

import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-share-link-audit',
  templateUrl: './share-link-audit.component.html',
  styleUrls: ['./share-link-audit.component.scss']
})
export class ShareLinkAuditComponent implements OnInit, AfterViewInit {

  @ViewChild('email') inputEmail;
  @ViewChild('code') inputCode;
  @Input() token;
  @Input() typeShareLink: string;
  @Input() p: string = null;
  @Output() sendDataAuditSuccess: EventEmitter<any> = new EventEmitter<any>();

  model = {
    'email': null,
    'code': null,
  };
  errorMessages = {
    'email': null,
    'code': null,
  };
  isLoading: boolean;
  isSendCode: boolean;
  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '88px'
  };
  choosenLanguage = '';
  params: any;

  logoURL = '';
  logoTooltip = '';
  allowRetryToGetLogo = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private notiService: NotificationService,
    private shareLinkService: ShareLinkService,
    private translate: TranslateService,
    private i18nService: I18nService,
    private adminService: AdminService,
    private nonAuthenService: NonAuthenticationService,
  ) { }

  ngOnInit() {
    this.choosenLanguage = this.i18nService.getLanguage();
    this.switchLanguage({ value: this.choosenLanguage });
    this.logoURL = this.nonAuthenService.getPageLogoLink();
  }

  ngAfterViewInit() {
    this.inputEmail.nativeElement.focus();
  }

  resetErrorMessages() {
    this.errorMessages = {
      'email': null,
      'code': null,
    };
  }

  submitSendCode() {
    this.resetErrorMessages();
    this.isLoading = true;
    this.shareLinkService.sendCodeAuditToEmail(this.token, this.model.email)
      .subscribe(resps => this.handleSuccessSendCode(resps), error => this.handleErrorSendCode(error));
  }

  handleSuccessSendCode(resps) {
    this.isLoading = false;
    this.isSendCode = true;
    this.inputCode.nativeElement.focus();
    this.notiService.showNotification('success', resps.message);
  }

  handleErrorSendCode(error) {
    console.error(error);
    this.isLoading = false;
    this.errorMessages.email = JSON.parse(error._body).message;
    this.inputEmail.nativeElement.focus();
    const valueInputEmail = this.inputEmail.nativeElement.value;
    this.inputEmail.nativeElement.setSelectionRange(0, valueInputEmail.length);
  }

  submitCheckCodeAudit() {
    this.shareLinkService.postCheckCodeAudit(this.typeShareLink, this.token, this.model.email, this.model.code, this.p)
      .subscribe(resps => this.sendDataAuditSuccess.emit(resps.data), error => this.handleErrorCheckCodeAudit(error));
  }

  handleErrorCheckCodeAudit(error) {
    console.error(error);
    this.errorMessages.code = JSON.parse(error._body).message;
    this.inputCode.nativeElement.focus();
    const valueInputCode = this.inputCode.nativeElement.value;
    this.inputCode.nativeElement.setSelectionRange(0, valueInputCode);
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translate.use(data.value);
  }

  getLogoURL() {
    this.logoURL = this.nonAuthenService.getPageLogoLink();
  }

  getLogoTooltip() {
    this.adminService.getRestapiSettingsByKeys('SITE_TITLE').subscribe(resp => {
      this.logoTooltip = resp.data.config_dict.SITE_TITLE;
      if (this.logoTooltip === '') {
        this.logoTooltip = `Syncwerk Web-App`;
      }
    });
  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }
}
