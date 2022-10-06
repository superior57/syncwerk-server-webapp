import { Component, OnInit, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NonAuthenticationService, NotificationService, AuthenticationService, SharedService, I18nService } from '@services/index';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { CookieOptions, CookieService } from 'ngx-cookie';
import { Select2OptionData } from 'ng2-select2';

@Component({
  selector: 'app-confirm-reset-password',
  templateUrl: './confirm-reset-password.component.html',
  styleUrls: ['./confirm-reset-password.component.scss']
})
export class ConfirmResetPasswordComponent implements OnInit, AfterViewInit {

  @ViewChild('newPassword') inputNewPass;
  @ViewChild('confirmPassword') inputConfirmNewPass;

  logoTooltip = '';
  isPageNotFound = false;
  uidb36Token: string;
  validToken = true;
  model = {
    new_password: '',
    confirm_password: '',
  };
  error = {
    type: '',
    message: '',
  };
  isProcessing = false;

  allowRetryToGetLogo = true;
  logoURL = '';

  choosenLanguage = this.cookieService.get('lang');

  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];

  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private nonAuthenticationService: NonAuthenticationService,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private router: Router,
    private authentication: AuthenticationService,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private cookieService: CookieService,
    private i18nService: I18nService,
  ) {
    this.renderer.setAttribute(document.body, 'data-ma-theme', this.sharedService.maTheme);
    this.choosenLanguage = this.i18nService.getLanguage();
    this.activatedRoute.params.subscribe(params => {
      this.uidb36Token = params.uidb36_token;
      this.checkExistsToken();
    });
  }

  ngOnInit() {
    this.getLogoURL();
   }

  ngAfterViewInit() {
    this.inputNewPass.nativeElement.focus();
  }

  checkExistsToken() {
    this.nonAuthenticationService.getConfirmPasswordReset(this.uidb36Token)
      .subscribe(resps => {
        this.validToken = true;
      }, error => {
        const status = error.status;
        switch (status) {
          case 404: this.validToken = false; break;
          default:
            this.notificationService.showNotification('danger', JSON.parse(error._body).message);
            break;
        }
      });
  }

  resetPassword() {
    this.isProcessing = true;
    this.nonAuthenticationService.getRestapiSettingsByKeys('USER_STRONG_PASSWORD_REQUIRED').subscribe((ck_strong) => {
      if (ck_strong.data.config_dict.USER_STRONG_PASSWORD_REQUIRED === 0) {
        this.checkMinLength();
      } else {
        this.resetPass();
      }
    });
  }

  checkMinLength() {
    this.nonAuthenticationService.getRestapiSettingsByKeys('USER_PASSWORD_MIN_LENGTH').subscribe((resp) => {
      if (this.model.new_password.length < resp.data.config_dict.USER_PASSWORD_MIN_LENGTH) {
        this.isProcessing = false;
        this.error = {
          type: 'password_error',
          message: this.translateService.instant('SIGNUP.MESSAGE.USER_PASSWORD_MIN_LENGTH', { number: resp.data.config_dict.USER_PASSWORD_MIN_LENGTH })
        };
      } else {
        this.resetPass();
      }
    });
  }

  resetPass() {
    this.nonAuthenticationService.postCofirmPasswordReset(this.uidb36Token, this.model.new_password, this.model.confirm_password)
      .subscribe(resps => {
        this.error = { type: '', message: '' };
        this.notificationService.showNotification('success', resps.message);
        this.router.navigate(['/login']);
      }, error => {
        this.isProcessing = false;
        this.handleResetPasswordError(JSON.parse(error._body));
        // this.notificationService.showNotification('danger', JSON.parse(error._body).message);
      });
  }

  handleResetPasswordError(errs: any) {
    if (errs.data.hasOwnProperty('new_password1')) {
      this.inputNewPass.nativeElement.focus();
      this.error = { type: 'password_error', message: errs.data.new_password1[0] };
    } else if (errs.data.hasOwnProperty('new_password2')) {
      this.inputConfirmNewPass.nativeElement.focus();
      this.error = { type: 'confirm_password_error', message: errs.data.new_password2[0] };
    }
  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }

  getLogoURL() {
    this.logoURL = `/media/custom/mylogo.png?r=${new Date().getTime()}`;
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translateService.use(data.value);
    this.choosenLanguage = data.value;
  }
}
