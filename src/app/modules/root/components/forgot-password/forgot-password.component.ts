import { Component, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { NonAuthenticationService, NotificationService, SharedService, I18nService, AdminService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { CookieOptions, CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {

  @ViewChild('email') inputEmail;
  existsEmail = false;
  modelEmail;
  error = {
    type: '',
    message: '',
  };
  isProcessing = false;
  successMessage: string;
  setting = {
    'ENABLE_SIGNUP': false,
  };
  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  choosenLanguage = this.cookieService.get('lang');
  logoURL = '';
  logoTooltip = '';
  allowRetryToGetLogo = true;

  constructor(
    private nonAuthenticationService: NonAuthenticationService,
    private notificationService: NotificationService,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private i18services: I18nService,
    private adminService: AdminService,
    private cookieService: CookieService,
  ) {
    this.renderer.setAttribute(document.body, 'data-ma-theme', this.sharedService.maTheme);
    this.getSetting();
  }

  ngOnInit() {
    this.successMessage = this.translateService.instant('LOGIN.LABEL.FORGOT_PASSWORD_SUCCESS_MESSAGE');
    this.getLogoURL();
    this.getLogoTooltip();
  }

  getLogoURL() {
    this.logoURL = `/media/custom/mylogo.png?r=${new Date().getTime()}`;
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
  switchLanguage(data: { value: string }) {
    this.i18services.setLanguage(data.value);
    this.translateService.use(data.value);
  }


  getSetting() {
    this.nonAuthenticationService.getRestapiSettingsByKeys('ENABLE_SIGNUP').subscribe(resp => {
      this.setting = resp.data.config_dict;
    });
  }

  ngAfterViewInit() {
    this.inputEmail.nativeElement.focus();
  }

  postResetPassword() {
    this.isProcessing = true;
    this.error = { type: '', message: '' };
    this.nonAuthenticationService.postPasswordReset(this.modelEmail)
      .subscribe(resps => {
        this.isProcessing = false;
        this.existsEmail = true;
      }, error => {
        this.isProcessing = false;
        console.error('forgot password: ', error);
        // this.notificationService.showNotification('danger', JSON.parse(error._body).message);
        this.notificationService.showNotification('danger', this.translateService.instant('NOTIFICATION_MESSAGE.WRONG_EMAIL'));
        this.handleResetPasswordError(JSON.parse(error._body));
      });
  }

  handleResetPasswordError(errs: any) {
    if (errs.hasOwnProperty('data')) {
      if (errs.data.hasOwnProperty('email')) {
        this.inputEmail.nativeElement.focus();
        this.error = { type: 'email', message: errs.data.email[0] };
      }
    }
  }
}
