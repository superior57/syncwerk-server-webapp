import * as moment from 'moment';
import 'moment/min/locales';

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AppConfig } from 'app/app.config';
import { Action, Type } from '@enum/index.enum';
import { User } from 'app/Models/User.model';
import { AuthenticationService, MessageService, NotificationService, I18nService, MeetingsService } from '@services/index';
import { Select2OptionData } from 'ng2-select2';
// components
import { ModalConfirmationComponent } from 'app/modules/shared/components/modal-confirmation/modal-confirmation.component';

declare var jQuery: any;

@Component({
  selector: 'app-layout-settings',
  templateUrl: './layout-settings.component.html',
  styleUrls: ['./layout-settings.component.scss']
})
export class LayoutSettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput;
  @ViewChild(ModalConfirmationComponent) modalConfirmationComponent;
  @ViewChild('input_onlyoffice_open_mode') input_onlyoffice_open_mode: ElementRef;

  param: any;
  userInfo: User = new User('', '', '');
  userAvatar: string;
  userTelephone: '';
  telErrorMessage: String = '';
  uploadAvatarIcon: String = ' fal fa-camera';
  profileChangeForm: FormGroup;
  post: any;
  isProcessing = true;
  /* defaultLanguage = 'en';
  languages = [
    {
      name: 'English',
      value: 'en'
    },
    {
      name: 'Deutsch',
      value: 'de'
    },
  ];
  choosenLanguage = ''; */
  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  choosenLanguage = 'en';
  defaultFolder;
  ownedFolders;
  isShowDefaultFolder;
  isOpenModal = {
    change_password: false,
    delete_account: false,
    choose_default_folder: false,
    delete_avatar: false,
  };
  isDefaultAvatar = false;

  emailChangeForm = {
    isShow: false,
    emailToChange: '',
    is_processing: false
  };

  bbbSettingForm = {
    isActive: false,
    bbbUrl: '',
    bbbSecret: '',
    isProcessing: false,
  }

  isResendConfirmEmailEnable= true;
  isCancelRequestEnable = true;
  isResendConfirmEmailProcessing = false;
  isCancelRequestProcessing = false;

  enableChangePassword = false;
  enableChangeEmail = false;
  enableBBBSettings = false;

  currentEmailChangeRequest = null;
  showAction = {
    'onlyoffice-open-mode':false
  };
  constructor(
      private authenService: AuthenticationService,
      private appConfig: AppConfig,
      private translate: TranslateService,
      private messageService: MessageService,
      private fb: FormBuilder,
      private noti: NotificationService,
      private router: Router,
      private i18nService: I18nService,
      private meetingsService: MeetingsService,
  ) {
    this.profileChangeForm = fb.group({
      'name': [null],
      'department': [null]
    });
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
  }

  ngOnInit() {
    this.initData();
    this.getUserInfo();
  }

  /* switchLanguage(language: string) {
    this.i18nService.setLanguage(language);
    this.translate.use(language);
  } */

  switchLanguage(data: { value: string }) {
    this.authenService.changeUserLanguage(data.value).subscribe(resp => {
      data.value === 'en' ? moment.locale('en-gb') : moment.locale('de');
      this.noti.showNotification('success', resp.message);
      this.messageService.send(Type.Page_Footer, 'update', '');
      this.i18nService.setLanguage(data.value);
      this.translate.use(data.value);
    });
  }

  initData() {
    this.defaultFolder = {
      id: '',
      name: ''
    };
    this.ownedFolders = [];
    this.isShowDefaultFolder = false;
  }

  getUserInfo() {

    const token = this.appConfig.GetDataWith('token');
    this.authenService.userWithAvatarInfo()
        .subscribe(resp => {
          setTimeout(() => this.isProcessing = false, 200);
          this.userInfo = new User(resp.data.nickname, resp.data.email, resp.data.department);
          // this.userAvatar = resp.data.avatar_url ? resp.data.avatar_url : '../assets/images/user_default.png';
          this.userInfo.space_usage = resp.data.space_usage;
          this.userInfo.space_quota = resp.data.space_quota;
          this.userInfo.onlyoffice_open_mode = resp.data.onlyoffice_open_mode;
          if (resp.data.is_default_avatar) {
            this.isDefaultAvatar = true;
          } else {
            this.isDefaultAvatar = false;
          }
          let avatarUrl, newAvatarUrl;
          avatarUrl = resp.data.avatar_url.split('/');
          avatarUrl.splice(0, 3);
          newAvatarUrl = avatarUrl.join('/');
          this.userAvatar = resp.data.avatar_url ? newAvatarUrl + `?r=${new Date().getTime()}` : '../assets/images/user_default.png';
          this.userTelephone = resp.data.telephone;
          this.defaultFolder = resp.data.default_repo;
          this.ownedFolders = resp.data.owned_repos;
          this.isShowDefaultFolder = this.defaultFolder ? true : false;
          this.currentEmailChangeRequest = resp.data.email_change_request;
          if (resp.data.bbb_private_setting) {
            this.bbbSettingForm.isActive = resp.data.bbb_private_setting.is_active;
            this.bbbSettingForm.bbbSecret = resp.data.bbb_private_setting.bbb_secret;
            this.bbbSettingForm.bbbUrl = resp.data.bbb_private_setting.bbb_server;
            this.bbbSettingForm.isProcessing = false;
          }

          // update permisison
          this.enableChangeEmail = resp.data.update_profile_permission.CHANGE_EMAIL;
          this.enableChangePassword = resp.data.update_profile_permission.UPDATE_PASSWORD;
          this.enableBBBSettings = resp.data.update_profile_permission.SET_CUSTOM_BBB_SERVER;
        }, error => console.error(error));
  }

  validatePhone(event) {
    let newPhone = event.target.value.trim();
    newPhone = newPhone.replace(/\s/g, '');
    const regex = /^\+?([0-9]+)/;
    if ((newPhone.match(regex) && this.isNumeric(newPhone)) || newPhone.length === 0) {
      this.telErrorMessage = '';
      this.userTelephone = event.target.value.trim();
    } else {
      this.telErrorMessage = 'Invalid phone number';
    }
  }
  onSelectFocus(ele) {
    this.userInfo.onlyoffice_open_mode = this.userInfo.onlyoffice_open_mode+' ';
    this.showAction[ele] = true;
  }
  onSelectBlur(ele) {
    setTimeout(() => {
      this.showAction[ele] = false;
      // Hack to trigger angular re-bind data
      this.userInfo.onlyoffice_open_mode = this.userInfo.onlyoffice_open_mode.toString().trim();
    }, 200);
  }
  isNumeric(value: any): boolean {
    return !isNaN(value - parseFloat(value));
  }

  showChangePassword() {
    jQuery('#modal-change-password').modal('show');
    this.messageService.send(Type.Change_Password, Action.Open_Change_Password_Modal, '');
  }
  changeOnlyofficeOpenMode(){
        const newVal = this.input_onlyoffice_open_mode.nativeElement.value.trim();
    this.authenService.changeUserInfo(this.userInfo.username, this.userInfo.department, this.userTelephone, newVal).subscribe(resp => {
                this.userInfo.onlyoffice_open_mode = newVal;
      this.noti.showNotification('success', resp.message);
    }, error => this.noti.showNotification('danger', error._body.message));
  }
  showDeleteAccount() {
    jQuery('#delete-account-modal').modal('show');
    this.messageService.send(Type.Delete_Account, Action.Open_Delete_Account_Modal, '');
  }

  profileChangePost(post) {
    if (this.telErrorMessage.length === 0) {
      this.authenService.changeUserInfo(post.name, post.department, this.userTelephone, this.userInfo.onlyoffice_open_mode).subscribe(resp => {
        this.noti.showNotification('success', resp.message);
      }, error => this.noti.showNotification('danger', error._body.message));
    } else {
    }
  }

  deleteAccountCallBack() {
    this.noti.showNotification('success', 'Account removed');
    this.router.navigate(['login']);
  }

  onChange(event) {
    const fileBrowser = this.fileInput.nativeElement;
    if (fileBrowser.files && fileBrowser.files[0]) {
      this.uploadAvatarIcon = 'fal fa-refresh fa-spin';
      this.authenService.changeUserAvatar(fileBrowser.files[0]).subscribe(resp => {
        this.noti.showNotification('success', this.translate.instant('MODAL_CONFIRMATION.TITLES.UPLOAD_AVATAR_SUCCESS'));
        this.getUserInfo();
        this.messageService.send(Type.Main_Page, Action.Change_Avatar, '');
        this.uploadAvatarIcon = ' fal fa-camera';
      }, error => {
        this.noti.showNotification('danger', JSON.parse(error._body).message);
        this.uploadAvatarIcon = ' fal fa-camera';
      });
    }
  }

  openDefaultFolder() {
    this.router.navigate(['/folders', this.defaultFolder.id]);
  }

  chooseDefaultFolder() {
    jQuery('#choose-default-folder-modal').modal('show');
  }

  defaultFolderCallback(event) {
    this.defaultFolder = event.newDefaultFolder;
  }

  onDeleteAvatar() {
    this.authenService.deleteUserAvatar().subscribe(resp => {
      if (resp.message === 'Deleted avatar successfully.') {
        this.noti.showNotification('success', this.translate.instant('MODAL_CONFIRMATION.TITLES.DELETE_AVATAR_SUCCESS'));
      } else {
        this.noti.showNotification('info', this.translate.instant('MODAL_CONFIRMATION.TITLES.AVATAR_NOT_EXIST'));
      }
      this.getUserInfo();
      this.messageService.send(Type.Main_Page, Action.Change_Avatar, '');
      this.modalConfirmationComponent.isProcessing = false;
      jQuery('#modal-confirmation').modal('hide');
    }, error => {
      this.modalConfirmationComponent.isProcessing = false;
      this.noti.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  handleOpenModal(nameModal: string) {
    if (nameModal === 'change-password') {
      this.isOpenModal.change_password = true;
      this.openModal('#modal-change-password', () => this.isOpenModal.change_password = false);
    } else if (nameModal === 'delete-avatar') {
      this.isOpenModal.delete_avatar = true;
      this.openModal('#modal-confirmation', () => this.isOpenModal.delete_avatar = false);
    }
  }

  openModal(idModal: string, functionCloseModal: any) {
    return new Promise(() => setTimeout(() => jQuery(idModal).on('hidden.bs.modal', functionCloseModal).modal('show')));
  }

  showEmailChangeForm() {
    this.emailChangeForm.isShow = true;
  }

  hideEmailChangeForm() {
    this.emailChangeForm.emailToChange = '';
    this.emailChangeForm.isShow = false;
  }

  submitEmailChangeRequest() {
    this.emailChangeForm.is_processing = true;
    this.authenService.postCreateEmailChangeRequest(this.emailChangeForm.emailToChange).subscribe((resp) => {
      this.noti.showNotification('success', resp.message);
      this.currentEmailChangeRequest = resp.data;
      this.emailChangeForm.isShow = false;
      this.emailChangeForm.is_processing = false;
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
      this.emailChangeForm.is_processing = false;
    });
  }

  resendVertificationEmailForChangeEmailRequest() {
    this.isResendConfirmEmailEnable = false;
    this.isCancelRequestEnable = false;
    this.isResendConfirmEmailProcessing = true;
    this.isCancelRequestProcessing = false;
    this.authenService.putResendConfirmationEmailForEmailChangeRequest(this.currentEmailChangeRequest.id)
        .subscribe(resp => {
          this.noti.showNotification('success', resp.message);
          this.currentEmailChangeRequest = resp.data;
          this.isResendConfirmEmailEnable = true;
          this.isCancelRequestEnable = true;
          this.isResendConfirmEmailProcessing = false;
          this.isCancelRequestProcessing = false;
        }, error => {
          this.noti.showNotification('danger',  JSON.parse(error._body).message);
          this.isResendConfirmEmailEnable = true;
          this.isCancelRequestEnable = true;
          this.isResendConfirmEmailProcessing = false;
          this.isCancelRequestProcessing = false;
        });
  }

  cancelEmailChangeRequest() {
    this.isResendConfirmEmailEnable = false;
    this.isCancelRequestEnable = false;
    this.isResendConfirmEmailProcessing = false;
    this.isCancelRequestProcessing = true;
    this.authenService.deleteCancelEmailChangeRequest(this.currentEmailChangeRequest.id)
        .subscribe(resp => {
          this.noti.showNotification('success', resp.message);
          this.currentEmailChangeRequest = null;
          this.isResendConfirmEmailEnable = true;
          this.isCancelRequestEnable = true;
          this.isResendConfirmEmailProcessing = false;
          this.isCancelRequestProcessing = false;
        }, error => {
          this.noti.showNotification('danger',  JSON.parse(error._body).message);
          this.isResendConfirmEmailEnable = true;
          this.isCancelRequestEnable = true;
          this.isResendConfirmEmailProcessing = false;
          this.isCancelRequestProcessing = false;
        });
  }

  submitBBBSetting() {
    this.bbbSettingForm.isProcessing = true;
    this.authenService.postUpdateUserProfileBBBSetting(this.bbbSettingForm).subscribe((resp) => {
      this.noti.showNotification('success', resp.message);
      this.bbbSettingForm.isProcessing = false;
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
      this.bbbSettingForm.isProcessing = false;
    });
  }

  testBBBSetting() {
    this.bbbSettingForm.isProcessing = true;
    this.meetingsService.testPrivateBBBConnection(this.bbbSettingForm.bbbUrl, this.bbbSettingForm.bbbSecret).subscribe((resp) => {
      this.noti.showNotification('success', resp.message);
      this.bbbSettingForm.isProcessing = false;
    }, error => {
      this.noti.showNotification('danger', JSON.parse(error._body).message);
      this.bbbSettingForm.isProcessing = false;
    })
  }
}
