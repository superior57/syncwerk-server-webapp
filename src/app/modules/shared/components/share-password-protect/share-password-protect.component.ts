import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from 'app/services';

import { Type } from '@enum/index.enum';
import { MessageService } from '@services/index';

@Component({
  selector: 'app-share-password-protect',
  templateUrl: './share-password-protect.component.html',
  styleUrls: ['./share-password-protect.component.scss']
})
export class SharePasswordProtectComponent implements OnInit, OnDestroy {
  @Input() PasswordProtect = true;
  @Input() Expiration = true;
  @Output() GenerateAction: EventEmitter<any> = new EventEmitter<any>();
  private subscription: Subscription;
  isPasswordProtection = false;
  isExpiration = false;
  isShowPass = false;
  errorMessage = '';
  model;
  isCreate = false;
  dayRegex = /^[0-9]+$/;
  data = {
  };
  isPassword = (this.errorMessage === 'PW_Required') || (this.errorMessage === 'PW_Length');
  params: any;
  numberOfCharacters = 0;

  constructor(
    private messageService: MessageService,
    private AdminService: AdminService,
  ) {
    this.subscribe();
  }

  ngOnInit() {
    this.initData();
    this.getSettingConfig();
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Password_Protect_Component, (payload) => {
      this.isPasswordProtection = false;
      this.isExpiration = false;
    });
  }

  getSettingConfig() {
    this.AdminService.getSysAdminSettingConfig().subscribe(resp => {
      this.numberOfCharacters = resp.data.config_dict.SHARE_LINK_PASSWORD_MIN_LENGTH;
    });
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  initData() {
    this.model = {
      password: '',
      repeat: '',
      days: ''
    };
    this.isCreate = false;
  }

  selectPasswordChange() {
    this.model.password = '';
    this.model.repeat = '';
    this.isPasswordProtection = !this.isPasswordProtection;
    this.errorMessage = '';
  }

  selectDayChange() {
    this.model.days = '';
    this.isExpiration = !this.isExpiration;
    this.errorMessage = '';
  }

  showPassword() {
    this.isShowPass = !this.isShowPass;
  }

  generatePassword() {
    this.model.password = this.randomString();
    this.model.repeat = this.model.password;
  }

  generateAction() {
    if (this.validate()) {
      this.GenerateAction.emit(this.data);
    }
  }


  validate() {
    if (this.isPasswordProtection) {
      if (this.model.password.length <= 0) {
        this.errorMessage = 'PW_Required';
        return false;
      }
      if (this.model.password.length < this.numberOfCharacters) {
        this.errorMessage = 'PW_Length';
        return false;
      }
      if (this.model.repeat.length <= 0) {
        this.errorMessage = 'RPP_Required';
        return false;
      }
      if (this.model.password !== this.model.repeat) {
        this.errorMessage = 'RPP';
        return false;
      }
      this.data['password'] = this.model.password;
    }

    if (this.isExpiration) {
      if (this.model.days.length <= 0) {
        this.errorMessage = 'D_Required';
        return false;
      }
      if (this.model.days > 90) {
        this.errorMessage = 'D_Exceed';
        return;
      }
      if (!this.dayRegex.test(this.model.days)) {
        this.errorMessage = 'D_Valid';
        return false;
      }
      this.data['expire_days'] = this.model.days;
    }
    this.errorMessage = '';
    return true;
  }

  randomString() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < this.numberOfCharacters; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  keyPress(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !this.dayRegex.test(inputChar)) {
      event.preventDefault();
    }
  }

  passwordChanged(event: any) {
    this.errorMessage = '';
  }
}
