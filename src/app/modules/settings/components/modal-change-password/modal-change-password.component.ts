import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CookieOptions, CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';

import { AppConfig } from 'app/app.config';
import { Action, Type } from '@enum/index.enum';
import { AuthenticationService, NonAuthenticationService, NotificationService, } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-modal-change-password',
  templateUrl: './modal-change-password.component.html',
  styleUrls: ['./modal-change-password.component.scss']
})
export class ModalChangePasswordComponent implements OnInit {
  private subscription: Subscription;

  @ViewChild('oldPassword') inputOldPassEle: ElementRef;
  @ViewChild('newPassword') inputNewPassEle: ElementRef;
  @ViewChild('confirmPassword') inputConfirmPassEle: ElementRef;

  model = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  currentLoginUser;
  error = {
    type: '',
    message: '',
  };
  isProcessing = false;
  strongPassword;
  minimumPassword;

  constructor(
    private authenticationService: AuthenticationService,
    private nonAuthenticationService: NonAuthenticationService,
    private appConfig: AppConfig,
    private router: Router,
    private cookieService: CookieService,
    private noti: NotificationService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.autoFocus();
    this.getCurrentLoginUser();
  }

  getCurrentLoginUser() {
    this.authenticationService.userInfo().subscribe(resps => {
      this.currentLoginUser = resps.data;
    }, error => console.error(error));
  }

  autoFocus() {
    return new Promise(() => setTimeout(() => this.inputOldPassEle.nativeElement.focus(), 600));
  }

  submitChangePassword() {
    this.isProcessing = true;
    if (this.model.oldPassword === '') {
      this.error = { type: 'old-password', message: 'This field may not be blank.' };
      this.isProcessing = false;
    } else if (this.model.newPassword === '') {
      this.error = { type: 'new-password1', message: 'This field may not be blank.' };
      this.isProcessing = false;
    } else if (this.model.confirmPassword === '') {
      this.error = { type: 'new-password2', message: 'This field may not be blank.' };
      this.isProcessing = false;
    } else if (this.model.oldPassword === this.model.newPassword) {
      this.noti.showNotification('danger', this.translateService.instant('FORMS.VALIDATES.DIFFERENT_PASSWORD'));
    } else {
      this.nonAuthenticationService.getRestapiSettingsByKeys('USER_STRONG_PASSWORD_REQUIRED').subscribe((ck_strong) => {
        this.strongPassword = ck_strong.data.config_dict.USER_STRONG_PASSWORD_REQUIRED;
        if (this.strongPassword === 0) {
          this.checkMinLength();
        } else {
          this.changePassword();
        }
      });
    }
  }

  checkMinLength() {
    this.nonAuthenticationService.getRestapiSettingsByKeys('USER_PASSWORD_MIN_LENGTH').subscribe((ck_minimum) => {
      this.minimumPassword = ck_minimum.data.config_dict.USER_PASSWORD_MIN_LENGTH;
      if (this.model.newPassword.length < this.minimumPassword) {
        this.error = {
          type: 'new-password1',
          message: this.translateService.instant('SIGNUP.MESSAGE.USER_PASSWORD_MIN_LENGTH', { number: this.minimumPassword })
        };
        this.isProcessing = false;
      } else {
        this.changePassword();
      }
    });
  }

  changePassword() {
    this.authenticationService.changePassword(this.model.oldPassword, this.model.newPassword, this.model.confirmPassword)
      .subscribe(resp => {
        this.error = { type: '', message: '' };
        this.handleChangePasswordSusscess(resp);
        this.login();
        this.isProcessing = false;
      }, error => {
        this.isProcessing = false;
        console.error('change password in profile setting: ', error);
        const errors = JSON.parse(error._body);
        this.validate(errors.data);
        this.isProcessing = false;
      });
  }

  handleChangePasswordSusscess(dataSuccess: any) {
    this.cookieService.remove('token');
    this.cookieService.remove('csrftoken');
    this.cookieService.remove('sessionid');
    this.noti.showNotification('success', this.translateService.instant('CHANGE_PASSWORD.CHANGE_PASSWORD_FIRST_LOGIN_SUCCESS'));
    this.closeModal();
    const token = dataSuccess.data.token;
    const now = new Date();
    now.setFullYear(now.getFullYear() + 1);
    // Create expire
    const cookieOptions: CookieOptions = {
      'expires': now.toISOString()
    };
    // Set token to cookie
    this.cookieService.put('token', token, cookieOptions);
  }

  login() {
    this.authenticationService.login(this.currentLoginUser.email, this.model.newPassword)
      .subscribe(data => { }, error => {
        console.error(error);
        this.router.navigate(['/login']);
      });
  }

  validate(dataErrors: any) {
    if (dataErrors.hasOwnProperty('old_password')) {
      this.inputOldPassEle.nativeElement.focus();
      this.error = { type: 'old-password', message: dataErrors.old_password };
    } else if (dataErrors.hasOwnProperty('new_password1')) {
      this.inputNewPassEle.nativeElement.focus();
      this.error = { type: 'new-password1', message: dataErrors.new_password1 };
    } else if (dataErrors.hasOwnProperty('new_password2')) {
      this.inputConfirmPassEle.nativeElement.focus();
      this.error = { type: 'new-password2', message: dataErrors.new_password2 };
    } else if (dataErrors.hasOwnProperty('password1')) {
      this.inputNewPassEle.nativeElement.focus();
      this.error = { type: 'new-password1', message: dataErrors.password1[0].message };
    } else if (dataErrors.hasOwnProperty('password2')) {
      this.inputNewPassEle.nativeElement.focus();
      this.error = { type: 'new-password2', message: dataErrors.password2[0].message };
    }
  }

  closeModal() {
    jQuery('#modal-change-password').modal('hide');
  }
}
