
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CookieOptions, CookieService } from 'ngx-cookie';
import { AuthenticationService, NonAuthenticationService, NotificationService, SharedService, I18nService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { CookieDisclaimerModalComponent } from '../../components/cookie-disclaimer-modal/cookie-disclaimer-modal.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  @ViewChild('oldPass') inputOldPassEle: ElementRef;
  @ViewChild('newPass') inputNewPassEle: ElementRef;
  @ViewChild('confirmPass') inputConfirmPassEle: ElementRef;

  currentLoginUser;
  model = {
    old_password: '',
    new_password: '',
    confirm_password: '',
  };
  error = {
    type: '',
    message: '',
  };
  strongPassword;
  minimumPassword;

  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  choosenLanguage = this.cookieService.get('lang');
  setting: any = {
    ENABLE_SIGNUP: false,
    ACTIVATE_AFTER_REGISTRATION: false,
    REGISTRATION_SEND_MAIL: false,
  };
  allowRetryToGetLogo = true;
  logoURL = '';

  constructor(
    private authenticationService: AuthenticationService,
    private nonAuthenticationService: NonAuthenticationService,
    private noti: NotificationService,
    private cookieService: CookieService,
    private router: Router,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private i18nService: I18nService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
  ) {
    this.renderer.setAttribute(document.body, 'data-ma-theme', this.sharedService.maTheme);

    this.authenticationService.checkLogin().subscribe(resp => {
      if (!resp.data.force_passwd_change) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnInit() {
    this.autoFocus();
    this.getCurrentLoginUser();
  }

  autoFocus() {
    return new Promise(() => setTimeout(() => this.inputOldPassEle.nativeElement.focus()));
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
    this.nonAuthenticationService.getSettingsByKeys(keys.join(',')).subscribe(resp => {
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
  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }



  getCurrentLoginUser() {
    this.authenticationService.userInfo().subscribe(resps => {
      this.currentLoginUser = resps.data;
    }, error => console.error(error));
  }

  resetError() {
    this.error = { type: '', message: '' };
  }

  changePassword() {
    if (this.model.old_password === '') {
      this.handleValidate(this.inputOldPassEle, this.model.old_password.length, 'old-password', this.translateService.instant('FORMS.INPUTS.BLANK_INPUT_FILED'));
    } else if (this.model.new_password === '') {
      this.handleValidate(this.inputNewPassEle, this.model.new_password.length, 'new-password', this.translateService.instant('FORMS.INPUTS.BLANK_INPUT_FILED'));
    } else if (this.model.confirm_password === '') {
      this.handleValidate(this.inputConfirmPassEle, this.model.confirm_password.length, 'confirm-password', this.translateService.instant('FORMS.INPUTS.BLANK_INPUT_FILED'));
    } else if (this.model.old_password === this.model.new_password) {
      this.noti.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.PASSWORD.SAME_PASSWORD'));
    } else {
      this.nonAuthenticationService.getRestapiSettingsByKeys('USER_STRONG_PASSWORD_REQUIRED').subscribe((ck_strong) => {
        this.strongPassword = ck_strong.data.config_dict.USER_STRONG_PASSWORD_REQUIRED;
        if (this.strongPassword === 0) {
          this.checkMinLength();
        } else {
          this.changePass();
        }
      });
    }
  }

  checkMinLength() {
    this.nonAuthenticationService.getRestapiSettingsByKeys('USER_PASSWORD_MIN_LENGTH').subscribe((ck_minimum) => {
      this.minimumPassword = ck_minimum.data.config_dict.USER_PASSWORD_MIN_LENGTH;
      if (this.model.new_password.length < this.minimumPassword) {
        this.handleValidate(
          this.inputNewPassEle,
          this.model.new_password.length,
          'new-password',
          this.translateService.instant('SIGNUP.MESSAGE.USER_PASSWORD_MIN_LENGTH', { number: this.minimumPassword })
        );
      } else {
        this.changePass();
      }
    });
  }

  changePass() {
    this.authenticationService.changePassword(this.model.old_password, this.model.new_password, this.model.confirm_password)
      .subscribe(resp => {
        this.handleChangePasswordSuccess(resp);
        this.resetError();
      }, error => {
        console.error(error);
        const errors = JSON.parse(error._body);
        this.validate(errors.data);
      });
  }

  handleChangePasswordSuccess(dataSuccess: any) {
    // this.noti.showNotification('success', dataSuccess.message);
    this.noti.showNotification('success', this.translateService.instant('CHANGE_PASSWORD.CHANGE_PASSWORD_FIRST_LOGIN_SUCCESS'));
    this.removeCookie();
    const token = dataSuccess.data.token;
    const now = new Date();
    now.setFullYear(now.getFullYear() + 1);
    // Create expire
    const cookieOptions: CookieOptions = { 'expires': now.toISOString() };
    // Set token to cookie
    this.cookieService.put('token', token, cookieOptions);
    this.login();
  }

  login() {
    this.authenticationService.login(this.currentLoginUser.email, this.model.new_password)
      .subscribe(data => this.router.navigate(['/']), error => {
        console.error(error);
        this.router.navigate(['/']);
      });
  }

  validate(dataErrors: any) {
    if (dataErrors.hasOwnProperty('old_password')) {
      const lengthValue = this.model.old_password.length;
      this.handleValidate(this.inputOldPassEle, lengthValue, 'old-password', dataErrors.old_password);
    } else if (dataErrors.hasOwnProperty('new_password1')) {
      const lengthValue = this.model.new_password.length;
      this.handleValidate(this.inputNewPassEle, lengthValue, 'new-password', dataErrors.new_password1);
    } else if (dataErrors.hasOwnProperty('password1')) {
      const lengthValue = this.model.new_password.length;
      this.handleValidate(this.inputNewPassEle, lengthValue, 'new-password', dataErrors.password1[0].message);
    } else if (dataErrors.hasOwnProperty('new_password2')) {
      const lengthValue = this.model.confirm_password.length;
      this.handleValidate(this.inputConfirmPassEle, lengthValue, 'confirm-password', dataErrors.new_password2);
    }
  }

  handleValidate(element: any, lengthValue: number, type: string, message: string) {
    element.nativeElement.focus();
    element.nativeElement.setSelectionRange(0, lengthValue);
    this.error = { type: type, message: message };
  }

  removeCookie() {
    this.cookieService.remove('token');
    this.cookieService.remove('csrftoken');
    this.cookieService.remove('sessionid');
  }
}
