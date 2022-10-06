
import { combineLatest as observableCombineLatest, Subject, Observable, Subscription } from 'rxjs';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { CookieOptions, CookieService } from 'ngx-cookie';
import { AuthenticationService, NotificationService, NonAuthenticationService, SharedService, I18nService, AdminService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { CookieDisclaimerModalComponent } from '../../components/cookie-disclaimer-modal/cookie-disclaimer-modal.component';
import { TypeaheadOptions } from 'ngx-bootstrap';


declare var jQuery: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  @ViewChild('username') inputUsername: ElementRef;
  @ViewChild('password') inputPassword: ElementRef;
  @ViewChild('captcha') inputCaptcha: ElementRef;

  isValidPassword = false;
  isValidEmail = false;
  errorMessage = '';
  changeData = new Subject<string>();
  dataLoginConfig: { [key: string]: any };
  dataCaptcha: { [key: string]: any };
  model = {
    username: '',
    password: '',
    captcha: '',
  };
  error = {
    type: '',
    message: '',
  };
  setting: any = {
    ENABLE_SIGNUP: false,
    ACTIVATE_AFTER_REGISTRATION: false,
    REGISTRATION_SEND_MAIL: false,
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
  remember_me = null;
  remember_days;

  constructor(
    private authenticationService: AuthenticationService,
    private http: Http,
    private router: Router,
    private cookieService: CookieService,
    private noti: NotificationService,
    private nonAuthenService: NonAuthenticationService,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private i18nService: I18nService,
    private adminService: AdminService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
  ) {
    this.renderer.setAttribute(document.body, 'data-ma-theme', this.sharedService.maTheme);
    this.checkLogin();
    this.getLoginConfig();
    this.getSetting();
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translateService.use(this.choosenLanguage);
    this.nonAuthenService.getRestapiSettingsByKeys('LOGIN_REMEMBER_DAYS').subscribe(resp => {
      this.remember_days = resp.data.config_dict.LOGIN_REMEMBER_DAYS;
    });
  }

  ngOnInit() {
    this.autoFocus();
    this.getLogoURL();
    this.getLogoTooltip();
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  prepareModalSubscription() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translateService.use(data.value);
    this.choosenLanguage = data.value;
  }

  getSetting() {
    const keys = [
      'ENABLE_SIGNUP',
      'SHOW_COOKIE_DISCLAIMER',
      'COOKIE_DISCLAIMER_TYPE',
      'COOKIE_BANNER_TEXT_EN',
      'COOKIE_BANNER_TEXT_DE',
      'COOKIE_MODAL_TEXT_EN',
      'COOKIE_MODAL_TEXT_DE'
    ];
    this.nonAuthenService.getSettingsByKeys(keys.join(',')).subscribe(resp => {
      this.setting = resp.data.config_dict;
      if (this.setting.SHOW_COOKIE_DISCLAIMER) {
        this.setting.SHOW_COOKIE_DISCLAIMER = this.isShowCookieDisclaimer();
      }
      this.displayCookieDisclaimerModal();
    });
  }

  isShowCookieDisclaimer() {
    const cookies = this.cookieService.getAll();
    if (Object.keys(cookies).length <= 0) {
      return true;
    } else {
      return false;
    }
  }

  displayCookieDisclaimerModal() {
    if (this.setting.SHOW_COOKIE_DISCLAIMER && this.setting.COOKIE_DISCLAIMER_TYPE === 'modal') {
      this.prepareModalSubscription();
      this.bsModalRef = this.modalService.show(CookieDisclaimerModalComponent, {
        class: 'modal-md',
        initialState: {
          disclaimerContent: this.choosenLanguage === 'en' ? this.setting.COOKIE_MODAL_TEXT_EN : this.setting.COOKIE_MODAL_TEXT_DE,
        }
      });
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


  ngOnDestroy() {
    this.changeData.unsubscribe();
  }

  checkLogin() {
    this.authenticationService.checkLogin().subscribe(resp => {
      this.router.navigate(['/home']);
    });
  }

  getLoginConfig() {
    this.nonAuthenService.getLoginConfig().subscribe(resps => {
      this.dataLoginConfig = resps.data;
      if (resps.data.IS_SHOWING_CAPTCHA) {
        this.dataCaptcha = resps.data.captcha;
      }
    });
  }

  autoFocus() {
    return new Promise(() => setTimeout(() => {
      this.inputUsername.nativeElement.focus();
    }, 600));
  }

  handleCheckBox(e) {
    if (e.target.checked) {
      this.remember_me = '1';
    }
  }

  login() {
    this.error = { type: '', message: '' };
    const captchaKey = this.dataLoginConfig.IS_SHOWING_CAPTCHA ? this.dataCaptcha.key : null;
    const captchaText = this.dataLoginConfig.IS_SHOWING_CAPTCHA ? this.model.captcha : null;
    if (this.remember_me === null) {
      this.remember_me = '0';
    }
    this.authenticationService.login(this.model.username, this.model.password, captchaKey, captchaText, this.remember_me)
      .subscribe(data => {
        this.loginSuccess(data.force_passwd_change);
      }, error => {
        this.inputUsername.nativeElement.focus();
        this.getLoginConfig();
        this.loginError(error);
      });
  }

  loginSuccess(focrceChangePassword: boolean = false) {
    const directBeforeLogin = localStorage.getItem('url');
    if (focrceChangePassword === true) {
      this.checkUserDefaultLanguage(true);
      this.router.navigate(['change-password']);
    } else {
      // alert('hahaha')
      // console.log(directBeforeLogin)
      if (directBeforeLogin && directBeforeLogin !== "/") {
        this.router.navigateByUrl(directBeforeLogin.slice(1, directBeforeLogin.length - 1));
      } else {
        this.checkUserDefaultLanguage();
        this.router.navigate(['/home']);
      }
    }
  }

  checkUserDefaultLanguage(focrceChangePassword = false) {
    this.authenticationService.userInfo().subscribe(resp => {
      // resp.data.language = '';
      const getDefaultLanguageFromBrowser = navigator.languages && navigator.languages[0] || navigator.language;
      if (resp.data.language === 'en') {
        this.cookieService.put('lang', resp.data.language);
      } else {
        if (getDefaultLanguageFromBrowser.includes('en-') === true) {
          this.cookieService.put('lang', 'en');
          this.translateService.use('en');
        } else {
          this.cookieService.put('lang', 'de');
          this.translateService.use('de');
        }
      }
      if (focrceChangePassword) {
        this.noti.showNotification('info', this.translateService.instant('CHANGE_PASSWORD.CHANGE_PASSWORD_FIRST_LOGIN'));
      }
    });
  }


  loginError(error) {
    const errors = JSON.parse(error._body);
    if (errors.hasOwnProperty('detail')) {
      this.noti.showNotification('danger', errors.detail);
    } else if (errors.hasOwnProperty('data')) {
      if (errors.data.hasOwnProperty('login')) {
        this.inputUsername.nativeElement.focus();
        this.error = { type: 'login', message: this.translateService.instant('LOGIN.MESSAGE.INCORRECT_USERNAME_OR_PASSWORD') };
      } else if (errors.data.hasOwnProperty('password')) {
        this.inputPassword.nativeElement.focus();
        this.error = { type: 'password', message: errors.data.password[0] };
      } else if (errors.data.hasOwnProperty('__all__')) {
        this.noti.showNotification('danger', this.translateService.instant('LOGIN.MESSAGE.INCORRECT_USERNAME_OR_PASSWORD'));
      } else if (errors.data.hasOwnProperty('captcha')) {
        this.inputCaptcha.nativeElement.focus();
        this.error = { type: 'captcha', message: this.translateService.instant('LOGIN.MESSAGE.INCORRECT_CAPTCHA') };
      } else if (errors.data.hasOwnProperty('non_field_errors')) {
        this.noti.showNotification('danger', this.translateService.instant('LOGIN.MESSAGE.INCORRECT_USERNAME_OR_PASSWORD'));
      }
    } else {

      if (errors.error_code) {
        if (errors.error_code === 'account_has_been_frozen_failed_login_attempts') {
          this.noti.showNotification('danger', this.translateService.instant('LOGIN.MESSAGE.ACCOUNT_HAS_BEEN_FROZEN'));
        }
      } else {
        this.noti.showNotification('danger', this.translateService.instant('LOGIN.MESSAGE.INCORRECT_USERNAME_OR_PASSWORD'));
      }
    }
  }

  refreshCaptcha() {
    this.nonAuthenService.getCaptcha().subscribe(resps => this.dataCaptcha = resps.data);
  }

  x2Captcha(captcha) {
    captcha.image_url = captcha.image_url.replace(/\/$/, '@2/');
    return captcha;
  }
}
