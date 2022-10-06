import { Component, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NonAuthenticationService, NotificationService, AuthenticationService, I18nService, SharedService, AdminService } from 'app/services';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Select2OptionData } from 'ng2-select2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit, AfterViewInit {

  @ViewChild('email') emailElementRef;
  @ViewChild('password') passwordElementRef;
  @ViewChild('confirmPassword') confirmPasswordElementRef;

  param = {};
  model = {
    email: '',
    password: '',
    confirm_password: '',
    terms: false
  };
  error = {
    type: '',
    message: ''
  };
  setting: any = {
    'ENABLE_SIGNUP': 0,
    'REGISTRATION_SEND_MAIL': 0,
    'ACTIVATE_AFTER_REGISTRATION': 0,
  };
  isProcessing = false;
  showRegisterSuccessfulMessage = false;
  registerSuccessfulMessage = '';
  showLoginForm = true;
  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  choosenLanguage = ''
  logoURL = '';
  logoTooltip = '';
  allowRetryToGetLogo = true;

  constructor(
    private nonAuthentication: NonAuthenticationService,
    private authentication: AuthenticationService,
    private notification: NotificationService,
    private router: Router,
    private cookieService: CookieService,
    private translate: TranslateService,
    private i18nService: I18nService,
    private sharedService: SharedService,
    private renderer: Renderer2,
    private adminService: AdminService,
  ) {
    this.choosenLanguage = this.i18nService.getLanguage();
    this.renderer.setAttribute(document.body, 'data-ma-theme', this.sharedService.maTheme);
    this.translate.use(this.i18nService.getLanguage());
  }

  ngOnInit() {
    this.getSetting();
    this.getLogoURL();
    this.getLogoTooltip();
  }
  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translate.use(data.value);
    this.choosenLanguage = data.value;
  }

  getSetting() {
    const settingKeys = [
      'REGISTRATION_SEND_MAIL',
      'ACTIVATE_AFTER_REGISTRATION',
      'REGISTER_PAGE_TERM_AND_CONDITION_CHECKBOX_TEXT_EN',
      'REGISTER_PAGE_TERM_AND_CONDITION_CHECKBOX_TEXT_DE',
    ];
    this.nonAuthentication.getSettingsByKeys(settingKeys.join(',')).subscribe(resp => {
      this.setting = resp.data.config_dict;
      this.setTermsAndConditionLabel();
    });
  }

  setTermsAndConditionLabel() {

  }

  ngAfterViewInit() {
    if (this.emailElementRef) {
      this.emailElementRef.nativeElement.focus();
    }
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

  submitRegister() {

    if (!this.model.terms) {
      console.log('User must select the terms');
      this.error = {
        type: 'terms',
        message: this.translate.instant('SIGNUP.MESSAGE.USER_MUST_CHECK_TERMS')
      };
      return;
    }
    this.isProcessing = true;
    this.nonAuthentication.getRestapiSettingsByKeys('USER_STRONG_PASSWORD_REQUIRED').subscribe((ck_strong) => {
      if (ck_strong.data.config_dict.USER_STRONG_PASSWORD_REQUIRED === 0) {
        this.checkMinLength();
      } else {
        this.register();
      }
    });
  }

  checkMinLength() {
    this.nonAuthentication.getRestapiSettingsByKeys('USER_PASSWORD_MIN_LENGTH').subscribe((resp) => {
      if (this.model.password.length < resp.data.config_dict.USER_PASSWORD_MIN_LENGTH) {
        this.isProcessing = false;
        this.error = {
          type: 'password_error',
          message: this.translate.instant('SIGNUP.MESSAGE.USER_PASSWORD_MIN_LENGTH', { number: resp.data.config_dict.USER_PASSWORD_MIN_LENGTH })
        };
      } else {
        this.register();
      }
    });
  }

  register() {
    this.nonAuthentication.postRegisterUser(this.model.email, this.model.password, this.model.confirm_password)
      .subscribe(
        resps => {
          this.error = { type: '', message: '' };
          // this.cookieService.removeAll();
          if (this.setting.ACTIVATE_AFTER_REGISTRATION === 1) {
            this.login();
          } else {
            if (this.setting.REGISTRATION_SEND_MAIL === 1) {
              this.registerSuccessfulMessage = this.translate.instant('SIGNUP.MESSAGE.SUCCESSFUL_MESSAGE_EMAIL_ACTIVATION');
            } else {
              this.registerSuccessfulMessage = this.translate.instant('SIGNUP.MESSAGE.SUCCESSFUL_MESSAGE_ADMIN_ACTIVATION');
            }
            this.showLoginForm = false;
            this.showRegisterSuccessfulMessage = true;
          }
        }, error => {
          this.error = { type: '', message: '' };
          this.isProcessing = false;
          console.error('register: ', error);
          this.handleError(error);
        });
  }

  login() {
    this.authentication.login(this.model.email, this.model.password).subscribe(
      resps => {
        this.isProcessing = false;
        this.router.navigate(['files']);
      }, error => {
        this.router.navigate(['login']);
        this.notification.showNotification('danger', JSON.parse(error._body).message);
        console.error('register login: ', error);
      });
  }

  handleError(error) {
    this.error = { type: '', message: '' };
    const errData = JSON.parse(error._body);
    if (errData.hasOwnProperty('data')) {
      const errs = JSON.parse(errData.data);
      if (errs.hasOwnProperty('email')) {
        this.emailElementRef.nativeElement.focus();
        this.error = { type: 'email_error', message: errs.email[0].message };
      } else if (errs.hasOwnProperty('password1')) {
        this.passwordElementRef.nativeElement.focus();
        this.error = { type: 'password_error', message: errs.password1[0].message };
      } else if (errs.hasOwnProperty('password2')) {
        this.confirmPasswordElementRef.nativeElement.focus();
        this.error = { type: 'confirm_password_error', message: errs.password2[0].message };
      }
    } else if (errData.hasOwnProperty('detail')) {
      this.emailElementRef.nativeElement.focus();
      this.notification.showNotification('danger', errData.detail);
    }
  }
}
