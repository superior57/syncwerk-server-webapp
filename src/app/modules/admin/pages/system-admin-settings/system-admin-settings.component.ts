
import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { AdminService, AuthenticationService, NotificationService, NonAuthenticationService, MessageService } from 'app/services';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Type, Action } from '@enum/index.enum';

import { ModalCmsFileChooserComponent } from '../../components/modal-cms-file-chooser/modal-cms-file-chooser.component';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-system-admin-settings',
  templateUrl: './system-admin-settings.component.html',
  styleUrls: ['./system-admin-settings.component.scss']
})
export class SystemAdminSettingsComponent implements OnInit {
  @ViewChild('input_service_url') input_service_url: ElementRef;
  @ViewChild('input_file_server_root') input_file_server_root: ElementRef;
  @ViewChild('input_allow_folders_in_batch') input_allow_folders_in_batch: ElementRef;
  @ViewChild('input_batch_max_files_count') input_batch_max_files_count: ElementRef;
  @ViewChild('input_keep_sign_in') input_keep_sign_in: ElementRef;
  @ViewChild('input_login_attempt_limit') input_login_attempt_limit: ElementRef;
  @ViewChild('input_password_strength_level') input_password_strength_level: ElementRef;
  @ViewChild('input_password_minimum_length') input_password_minimum_length: ElementRef;
  @ViewChild('input_folder_password_minimum_length') input_folder_password_minimum_length: ElementRef;
  @ViewChild('input_link_password_minimum_length') input_link_password_minimum_length: ElementRef;
  @ViewChild('input_preview_file_extensions') input_preview_file_extensions: ElementRef;
  @ViewChild('cookie_disclaimer_banner_en') cookie_disclaimer_banner_en: ElementRef;
  @ViewChild('cookie_disclaimer_banner_de') cookie_disclaimer_banner_de: ElementRef;
  @ViewChild('cookie_disclaimer_modal_en') cookie_disclaimer_modal_en: ElementRef;
  @ViewChild('cookie_disclaimer_modal_de') cookie_disclaimer_modal_de: ElementRef;
  @ViewChild('terms_and_conditions_text_de') terms_and_conditions_text_de: ElementRef;
  @ViewChild('terms_and_conditions_text_en') terms_and_conditions_text_en: ElementRef;
  @ViewChild('fileLogoInput') fileLogoInput: ElementRef;
  @ViewChild('fileFaviconInput') fileFaviconInput: ElementRef;
  @ViewChild('support_page_de_link') support_page_de_link: ElementRef;
  @ViewChild('support_page_en_link') support_page_en_link: ElementRef;
  @ViewChild('privacy_policy_de_link') privacy_policy_de_link: ElementRef;
  @ViewChild('privacy_policy_en_link') privacy_policy_en_link: ElementRef;
  @ViewChild('terms_de_link') terms_de_link: ElementRef;
  @ViewChild('terms_en_link') terms_en_link: ElementRef;
  @ViewChild('welcome_message_de_link') welcome_message_de_link: ElementRef;
  @ViewChild('welcome_message_en_link') welcome_message_en_link: ElementRef;
  @ViewChild('legal_notice_de_link') legal_notice_de_link: ElementRef;
  @ViewChild('legal_notice_en_link') legal_notice_en_link: ElementRef;
  @ViewChild('input_bbb_server_url') input_bbb_server_url: ElementRef;
  @ViewChild('input_bbb_secret_key') input_bbb_secret_key: ElementRef;
  @ViewChild('input_bbb_default_meetings_amount') input_bbb_default_meetings_amount: ElementRef;
  // only office settings
  @ViewChild('input_onlyoffice_apijs_url') input_onlyoffice_apijs_url: ElementRef;
  @ViewChild('input_verify_onlyoffice_certificate') input_verify_onlyoffice_certificate: ElementRef;
  @ViewChild('input_enable_onlyoffice') input_enable_onlyoffice: ElementRef;
  @ViewChild('input_onlyoffice_file_extensions') input_onlyoffice_file_extensions: ElementRef;
  @ViewChild('input_onlyoffice_edit_file_extensions') input_onlyoffice_edit_file_extensions: ElementRef;
  @ViewChild('input_onlyoffice_open_mode') input_onlyoffice_open_mode: ElementRef;

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  settingConfig;
  showAction = {
    'service-url': false,
    'file-server-root': false,
    'allow-folders-in-batch': false,
    'batch-max-files-count': false,
    'keep-sign-in': false,
    'login-attempt-limit': false,
    'password-minimum-length': false,
    'folder-password-minimum-length': false,
    'preview-file-extensions': false,
    'cookie-disclaimer-banner-en-text': false,
    'cookie-disclaimer-banner-de-text': false,
    'cookie-disclaimer-modal-en-text': false,
    'cookie-disclaimer-modal-de-text': false,
    'terms-and-conditions-text-en': false,
    'terms-and-conditions-text-de': false,
    'support_page_de_link': false,
    'support_page_en_link': false,
    'terms_de_link': false,
    'terms_en_link': false,
    'privacy_policy_de_link': false,
    'privacy_policy_en_link': false,
    'welcome_message_de_link': false,
    'welcome_message_en_link': false,
    'legal_notice_de_link': false,
    'legal_notice_en_link': false,
    'bbb-server-url': false,
    'bbb-secret-key':false,
    'bbb-default-amount-of-meetings': false,
    //only office
    'enable-onlyoffice':false,
    'verify-onlyoffice-certificate':false,
    'onlyoffice-apijs-url':false,
    'onlyoffice-file-extension':false,
    'onlyoffice-edit-file-extension':false,
    'onlyoffice-open-mode':false
  };
  logoUploading = false;
  faviconUploading = false;
  isProcessing = true;
  logoURL = '';
  logoStaticPath = '/media/custom/mylogo.png';
  logoDefaultPath = '/media/img/syncwerk-logo.png';
  faviconURL = '';
  faviconStaticPath = '/media/custom/favicon.ico';
  faviconDefaultPath = '/media/img/favicon.ico';
  params: any;

  cookieDisclaimerOptions = [
    {
      id: 'banner',
      display: this.translateService.instant('ADMIN.SETTINGS.COOKIE_DISCLAIMER.COOKIE_DISCLAIMER_TYPE_OPTION_BANNER')
    },
    {
      id: 'modal',
      display: this.translateService.instant('ADMIN.SETTINGS.COOKIE_DISCLAIMER.COOKIE_DISCLAIMER_TYPE_OPTION_MODAL')
    }
  ];

  hostOrigin = window.location.origin;

  currentUserPermission: any = {
    can_view_system_info: false,
    can_config_system: false,
  };

  isEnabledAdminArea = false;
  isTestingBBBConnection = false;

  constructor(
      private adminService: AdminService,
      private notif: NotificationService,
      private ref: ChangeDetectorRef,
      private router: Router,
      private translateService: TranslateService,
      private modalService: BsModalService,
      private changeDetection: ChangeDetectorRef,
      private authService: AuthenticationService,
      private nonAuthService: NonAuthenticationService,
      private messageService: MessageService,

  ) { }

  ngOnInit() {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledAdminArea = resp.data.admin_area;
      if (!this.isEnabledAdminArea) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;

    });
    this.getSettingConfig();
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
        this.modalService.onHide.subscribe((reason: string) => {
          this.getSettingConfig();
        })
    );

    this.subscriptions.push(
        this.modalService.onHidden.subscribe((reason: string) => {
          this.unsubscribe();
        })
    );
  }

  getSettingConfig() {
    this.adminService.getSysAdminSettingConfig().subscribe(resp => {
      setTimeout(() => this.isProcessing = false, 1000);
      this.settingConfig = resp.data.config_dict;
      // this.logoURL = `${this.settingConfig.SERVICE_URL}${this.logoStaticPath}?${new Date().getTime()}`;
      // this.faviconURL = `${this.settingConfig.SERVICE_URL}${this.faviconStaticPath}?${new Date().getTime()}`;
      // this.logoURL = `${this.logoStaticPath}?${new Date().getTime()}`;
      // this.faviconURL = `${this.faviconStaticPath}?${new Date().getTime()}`;
      if (this.settingConfig.HAS_CUSTOM_LOGO) {
        this.logoURL = `${this.logoStaticPath}?${new Date().getTime()}`;
      } else {
        this.logoURL = `${this.logoDefaultPath}?${new Date().getTime()}`;
      }

      if (this.settingConfig.HAS_CUSTOM_FAVICON) {
        this.faviconURL = `${this.faviconStaticPath}?${new Date().getTime()}`;
      } else {
        this.faviconURL = `${this.faviconDefaultPath}?${new Date().getTime()}`;
      }
      // this.isProcessing = false
    }, err => {
      console.error(err);
    });
  }

  onFocus(ele, oldVal) {
    this.settingConfig[oldVal] = this.settingConfig[oldVal].toString().trim();
    this.showAction[ele] = true;
  }
  onSelectFocus(ele, oldVal) {
    this.settingConfig[oldVal] = this.settingConfig[oldVal]+' ';
    this.showAction[ele] = true;
  }

  onBlur(ele, oldVal) {
    setTimeout(() => {
      this.showAction[ele] = false;
      // Hack to trigger angular re-bind data
      this.settingConfig[oldVal] = this.settingConfig[oldVal] + ' ';
    }, 200);
  }

  onSelectBlur(ele, oldVal) {
    setTimeout(() => {
      this.showAction[ele] = false;
      // Hack to trigger angular re-bind data
      this.settingConfig[oldVal] = this.settingConfig[oldVal].toString().trim();
    }, 200);
  }

  onEnter(e) {
    console.log(e);
    if (e === 'service-url') {
      this.changeServiceURL();
      this.input_service_url.nativeElement.blur();
    } else if (e === 'keep-sign-in') {
      this.changeKeepSignIn();
      this.input_keep_sign_in.nativeElement.blur();
    } else if (e === 'login-attempt-limit') {
      this.changeLoginAttemptLimit();
      this.input_login_attempt_limit.nativeElement.blur();
    } else if (e === 'password-minimum-length') {
      this.changePasswordMinimumLength();
      this.input_password_minimum_length.nativeElement.blur();
    } else if (e === 'folder-password-minimum-length') {
      this.changeFolderPasswordMinimumLength();
      this.input_folder_password_minimum_length.nativeElement.blur();
    } else if (e === 'link-password-minimum-length') {
      this.changeLinkPasswordMinimumLength();
      this.input_link_password_minimum_length.nativeElement.blur();
    } else if (e === 'preview-file-extensions') {
      this.changePreviewFileExtensions();
      this.input_preview_file_extensions.nativeElement.blur();
    } else if (e === 'bbb-server-url') {
      this.input_bbb_server_url.nativeElement.blur();
      this.changeB3ServerURL();
    }else if (e === 'bbb-secret-key') {
      this.input_bbb_secret_key.nativeElement.blur();
      this.changeB3SecretKey();
    }else if (e === 'bbb-default-amount-of-meetings') {
      this.input_bbb_default_meetings_amount.nativeElement.blur();
      this.changeB3DefaultMeetingAmount();
    }else {
      this.changeFileServiceRoot();
      this.input_file_server_root.nativeElement.blur();
    }
  }

  settingSystemAdmin(key, newVal) {
    this.adminService.settingSystemAdmin(key, newVal).subscribe(resp => {
      this.getSettingConfig();
      this.notif.showNotification('success', this.translateService.instant('ADMIN.SETTINGS.UPDATE_SETTING_SUCCESSFULLY'));
      if (key === 'BBB_ENABLED') {
        this.messageService.send(Type.Side_Menu_Bar_Component, Action.Show_Hide_Meeting_Menu, newVal);
      }
    }, error => {
      console.error(error);
      this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.UPDATE_SETTING_ERROR'));
    });
  }

  settingSystemAdminInput(key, oldVal, newVal, showKey) {
    if (newVal !== oldVal) {
      this.settingSystemAdmin(key, newVal);
    }
    this.showAction[showKey] = false;
  }

  changeSystemSettingToggle(event, key) {
    if (key === 'DISABLE_SYNC_WITH_ANY_FOLDER') {
      this.settingSystemAdmin(key, event.target.checked ? 0 : 1);
    } else {
      this.settingSystemAdmin(key, event.target.checked ? 1 : 0);
    }
  }

  changeServiceURL() {
    const newVal = this.input_service_url.nativeElement.value.trim();
    this.settingSystemAdminInput('SERVICE_URL', this.settingConfig.SERVICE_URL, newVal, 'service-url');
  }

  changeB3ServerURL() {
    const newVal = this.input_bbb_server_url.nativeElement.value.trim();
    this.settingSystemAdminInput('BBB_SERVER_URL', this.settingConfig.BBB_SERVER_URL, newVal, 'bbb-server-url');
  }

  changeB3SecretKey() {
    const newVal = this.input_bbb_secret_key.nativeElement.value.trim();
    this.settingSystemAdminInput('BBB_SECRET_KEY', this.settingConfig.BBB_SECRET_KEY, newVal, 'bbb-secret-key');
  }

  changeB3DefaultMeetingAmount() {
    const newVal = this.input_bbb_default_meetings_amount.nativeElement.value.trim();
    this.settingSystemAdminInput('BBB_MAX_MEETINGS_PER_USER', this.settingConfig.BBB_SECRET_KEY, newVal, 'bbb-default-amount-of-meetings');
  }

  changeFileServiceRoot() {
    const newVal = this.input_file_server_root.nativeElement.value.trim();
    this.settingSystemAdminInput('FILE_SERVER_ROOT', this.settingConfig.FILE_SERVER_ROOT, newVal, 'file-server-root');
  }
  changeAllowFoldersInBatch(event, key) {
    this.settingSystemAdmin(key, event.target.checked ? '1' : '0');
  }
  changeBooleanVal(event, key){
    this.settingSystemAdmin(key, event.target.checked ? '1' : '0');
  }
  changeOnlyofficeUrl(){
    const newVal = this.input_onlyoffice_apijs_url.nativeElement.value.trim();
    this.settingSystemAdminInput('ONLYOFFICE_APIJS_URL', this.settingConfig.ONLYOFFICE_APIJS_URL, newVal, 'onlyoffice-apijs-url');
  }
  changeOnlyofficeExtensions(){
    const newVal = this.input_onlyoffice_file_extensions.nativeElement.value.trim();
    this.settingSystemAdminInput('ONLYOFFICE_FILE_EXTENSION', this.settingConfig.ONLYOFFICE_FILE_EXTENSION, newVal, 'onlyoffice-file-extension');
  }
  changeOnlyofficeEditExtensions() {
    const newVal = this.input_onlyoffice_edit_file_extensions.nativeElement.value.trim();
    this.settingSystemAdminInput('ONLYOFFICE_EDIT_FILE_EXTENSION', this.settingConfig.ONLYOFFICE_EDIT_FILE_EXTENSION, newVal, 'onlyoffice-edit-file-extension');
  }
  changeOnlyofficeOpenMode(){
    const newVal = this.input_onlyoffice_open_mode.nativeElement.value.trim();
        this.settingSystemAdminInput('ONLYOFFICE_OPEN_MODE', this.settingConfig.ONLYOFFICE_OPEN_MODE, newVal, 'onlyoffice-open-mode');

  }
  changeBatchMaxFilesCount() {
    const newVal = this.input_batch_max_files_count.nativeElement.value.trim();
    this.settingSystemAdminInput('BATCH_MAX_FILES_COUNT', this.settingConfig.BATCH_MAX_FILES_COUNT, newVal, 'batch-max-files-count');
  }

  changeKeepSignIn() {
    const newVal = this.input_keep_sign_in.nativeElement.value.trim();
    this.settingSystemAdminInput('LOGIN_REMEMBER_DAYS', this.settingConfig.LOGIN_REMEMBER_DAYS.toString().trim(), newVal, 'keep-sign-in');
  }

  changeLoginAttemptLimit() {
    const newVal = this.input_login_attempt_limit.nativeElement.value.trim();
    this.settingSystemAdminInput(
        'LOGIN_ATTEMPT_LIMIT',
        this.settingConfig.LOGIN_ATTEMPT_LIMIT.toString().trim(),
        newVal,
        'login-attempt-limit'
    );
  }

  changePasswordStrengthLevel() {
    const newVal = this.input_password_strength_level.nativeElement.value.trim();
    this.settingSystemAdminInput(
        'USER_PASSWORD_STRENGTH_LEVEL',
        this.settingConfig.USER_PASSWORD_STRENGTH_LEVEL.toString().trim(),
        newVal,
        'password-strength-level'
    );
  }

  changePasswordMinimumLength() {
    const newVal = this.input_password_minimum_length.nativeElement.value.trim();
    this.settingSystemAdminInput(
        'USER_PASSWORD_MIN_LENGTH',
        this.settingConfig.USER_PASSWORD_MIN_LENGTH.toString().trim(),
        newVal,
        'password-minimum-length'
    );
  }

  changeFolderPasswordMinimumLength() {
    const newVal = this.input_folder_password_minimum_length.nativeElement.value.trim();
    this.settingSystemAdminInput(
        'REPO_PASSWORD_MIN_LENGTH',
        this.settingConfig.REPO_PASSWORD_MIN_LENGTH.toString().trim(),
        newVal,
        'folder-password-minimum-length'
    );
  }

  changeLinkPasswordMinimumLength() {
    const newVal = this.input_link_password_minimum_length.nativeElement.value.trim();
    this.settingSystemAdminInput(
        'SHARE_LINK_PASSWORD_MIN_LENGTH',
        this.settingConfig.SHARE_LINK_PASSWORD_MIN_LENGTH.toString().trim(),
        newVal,
        'link-password-minimum-length'
    );
  }

  changePreviewFileExtensions() {
    const newVal = this.input_preview_file_extensions.nativeElement.value.trim();
    this.settingSystemAdminInput('TEXT_PREVIEW_EXT', this.settingConfig.TEXT_PREVIEW_EXT, newVal, 'preview-file-extensions');
  }

  onUpdateLogo(event) {
    const fileList = event.target.files;
    if (fileList.length <= 0) {
      this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.YOU_NEED_TO_CHOOSE_AN_IMAGE'));
      return;
    }
    if (!fileList[0].type.match('image.*')) {
      this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.YOU_NEED_TO_CHOOSE_A_VALID_IMAGE'));
      return;
    }
    this.logoUploading = true;
    this.adminService.postChangeLogo(event.target.files[0]).subscribe(
        resps => {
          this.notif.showNotification('success', this.translateService.instant('ADMIN.SETTINGS.UPDATE_LOGO_SUCCESSFULLY'));
          this.logoURL = `${this.settingConfig.SERVICE_URL}${this.logoStaticPath}?random=${Math.random()}`;
          jQuery('img[class="header-logo"]').attr('src', this.logoURL);
          this.logoUploading = false;
        }, error => {
          console.error('change logo error: ', error);
          this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.CHANGE_LOGO_FAILED'));
        }
    );
  }

  onUpdateFavicon(event) {
    const fileList = event.target.files;
    if (fileList.length <= 0) {
      this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.YOU_NEED_TO_CHOOSE_AN_IMAGE'));
      return;
    }
    if (!fileList[0].type.match('image.*')) {
      this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.YOU_NEED_TO_CHOOSE_A_VALID_IMAGE'));
      return;
    }
    this.faviconUploading = true;
    this.adminService.postChangeFavicon(event.target.files[0]).subscribe(
        resps => {
          this.notif.showNotification('success', this.translateService.instant('ADMIN.SETTINGS.UPDATE_FAVICON_SUCCESSFULLY'));
          this.faviconURL = `${this.settingConfig.SERVICE_URL}${this.faviconStaticPath}?${new Date().getTime()}`;
          jQuery('link[rel="icon"]').attr('href', this.faviconURL);
          this.faviconUploading = false;
        }, error => {
          console.error('change favicon error: ', error);
          this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.CHANGE_FAVICON_FAILED'));
        }
    );
  }

  handleFavError() {
    this.faviconURL = `${this.settingConfig.SERVICE_URL}/media/img/favicon.ico`;
  }

  handleLogoError() {
    this.logoURL = `${this.settingConfig.SERVICE_URL}/media/img/syncwerk-logo.png`;
  }

  resetLogo() {
    this.adminService.postResetLogo().subscribe(resp => {
      this.notif.showNotification('success', this.translateService.instant('ADMIN.SETTINGS.RESET_LOGO_SUCCESSFULLY'));
      this.logoURL = `${this.settingConfig.SERVICE_URL}/media/img/syncwerk-logo.png`;
      jQuery('img[class="header-logo"]').attr('src', this.logoURL);
    }, error => {
      console.error('change favicon error: ', error);
      this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.RESET_LOGO_FAILED'));
    });
  }

  resetFavIcon() {
    this.adminService.postResetFavicon().subscribe(
        resp => {
          this.notif.showNotification('success', this.translateService.instant('ADMIN.SETTINGS.RESET_FAVICON_SUCCESSFULLY'));
          this.faviconURL = `${this.settingConfig.SERVICE_URL}/media/img/favicon.ico`;
          jQuery('link[rel="icon"]').attr('href', this.faviconURL);
        }, error => {
          console.error('change favicon error: ', error);
          this.notif.showNotification('danger', this.translateService.instant('ADMIN.SETTINGS.RESET_FAVICON_FAILED'));
        });
  }

  changeSystemSettingSelect(event, settingEntry) {
    this.settingSystemAdmin(settingEntry, event.target.value);
  }

  changeTextSettings(settingKey) {
    let newVal = '';
    switch (settingKey) {
      case 'COOKIE_BANNER_TEXT_DE':
        newVal = this.cookie_disclaimer_banner_de.nativeElement.value.trim();
        break;
      case 'COOKIE_BANNER_TEXT_EN':
        newVal = this.cookie_disclaimer_banner_en.nativeElement.value.trim();
        break;
      case 'COOKIE_MODAL_TEXT_DE':
        newVal = this.cookie_disclaimer_modal_de.nativeElement.value.trim();
        break;
      case 'COOKIE_MODAL_TEXT_EN':
        newVal = this.cookie_disclaimer_modal_en.nativeElement.value.trim();
        break;
      case 'REGISTER_PAGE_TERM_AND_CONDITION_CHECKBOX_TEXT_DE':
        newVal = this.terms_and_conditions_text_de.nativeElement.value.trim();
        break;
      case 'REGISTER_PAGE_TERM_AND_CONDITION_CHECKBOX_TEXT_EN':
        newVal = this.terms_and_conditions_text_en.nativeElement.value.trim();
        break;
      case 'SUPPORT_PAGE_DE_HTML_FILE_PATH':
        newVal = this.support_page_de_link.nativeElement.value.trim();
        break;
      case 'SUPPORT_PAGE_EN_HTML_FILE_PATH':
        newVal = this.support_page_en_link.nativeElement.value.trim();
        break;
      case 'PRIVACY_POLICY_EN_HTML_FILE_PATH':
        newVal = this.privacy_policy_en_link.nativeElement.value.trim();
        break;
      case 'PRIVACY_POLICY_DE_HTML_FILE_PATH':
        newVal = this.privacy_policy_de_link.nativeElement.value.trim();
        break;
      case 'TERMS_EN_HTML_FILE_PATH':
        newVal = this.terms_en_link.nativeElement.value.trim();
        break;
      case 'TERMS_DE_HTML_FILE_PATH':
        newVal = this.terms_de_link.nativeElement.value.trim();
        break;
      case 'WELCOME_MESSAGE_EN_HTML_FILE_PATH':
        newVal = this.welcome_message_en_link.nativeElement.value.trim();
        break;
      case 'WELCOME_MESSAGE_DE_HTML_FILE_PATH':
        newVal = this.welcome_message_de_link.nativeElement.value.trim();
        break;
      case 'LEGAL_NOTICES_EN_HTML_FILE_PATH':
        newVal = this.legal_notice_en_link.nativeElement.value.trim();
        break;
      case 'LEGAL_NOTICES_DE_HTML_FILE_PATH':
        newVal = this.legal_notice_de_link.nativeElement.value.trim();
        break;
    }
    this.settingSystemAdmin(settingKey, newVal);
  }

  openFileChooserModal(settingKeyToSet) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCmsFileChooserComponent, {
      class: 'modal-lg',
      initialState: {
        allowedExt: 'html',
        settingKey: settingKeyToSet,
        currentValue: this.settingConfig[settingKeyToSet] || '',
      }
    });
  }

  openLogoFileChooser() {
    this.fileLogoInput.nativeElement.click();
  }

  openFaviconFileChooser() {
    this.fileFaviconInput.nativeElement.click();
  }

  clearPage(settingKey) {
    this.adminService.settingSystemAdmin(settingKey, '').subscribe(resp => {
      this.getSettingConfig();
      this.notif.showNotification('success', this.translateService.instant('ADMIN.SETTINGS.UPDATE_SETTING_SUCCESSFULLY'));
    });
  }

  testMeetingConnection() {
    this.isTestingBBBConnection = true;
    this.adminService.testMeetingConnection().subscribe(resp => {
      this.notif.showNotification('success', resp.message);
      this.isTestingBBBConnection = false;
    }, err => {
      const status = err.status;
      switch (status) {
        case 401:
          this.notif.showNotification('danger', JSON.parse(err._body).detail);
          break;
        case 400:
          this.notif.showNotification('danger', JSON.parse(err._body).message);
          break;
        default:
          console.log(err);
      }
      this.isTestingBBBConnection = false;
    });
  }
}
