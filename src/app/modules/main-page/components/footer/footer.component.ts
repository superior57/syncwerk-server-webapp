import { Component, OnInit, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';

import { NonAuthenticationService, MessageService } from '@services/index';
import { Type } from '@enum/index.enum';

declare var jQuery: any;
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {

  private subscription: Subscription;

  selectedLang = 'en';
  showFooters = false;
  config_dict: any = {};
  links: any = {};

  constructor(
    private nonAuthService: NonAuthenticationService,
    private cookieService: CookieService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.subscribe();
    this.getSettings();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Page_Footer, (payload) => {
      console.log('this is thew payload', payload);
      switch (payload.action.toLowerCase()) {
        case 'update':
          this.getSettings();
          break;
        default:
          break;
      }
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getSettings() {
    const keys = [
      'SUPPORT_PAGE_ENABLE',
      'SUPPORT_PAGE_EN_HTML_FILE_PATH',
      'SUPPORT_PAGE_DE_HTML_FILE_PATH',
      'PRIVACY_POLICY_ENABLE',
      'PRIVACY_POLICY_EN_HTML_FILE_PATH',
      'PRIVACY_POLICY_DE_HTML_FILE_PATH',
      'TERMS_ENABLE',
      'TERMS_EN_HTML_FILE_PATH',
      'TERMS_DE_HTML_FILE_PATH',
      'WELCOME_MESSAGE_ENABLE',
      'WELCOME_MESSAGE_EN_HTML_FILE_PATH',
      'WELCOME_MESSAGE_DE_HTML_FILE_PATH',
      'LEGAL_NOTICES_ENABLE',
      'LEGAL_NOTICES_EN_HTML_FILE_PATH',
      'LEGAL_NOTICES_DE_HTML_FILE_PATH',
    ];
    this.nonAuthService.getSettingsByKeys(keys.join(',')).subscribe(resp => {
      this.config_dict = resp.data.config_dict;
      this.handleLanguage();
    });
  }

  handleLanguage() {
    this.showFooters = false;
    const lang = this.cookieService.get('lang');
    if (lang === 'de') {
      this.links.SUPPORT_PAGE_HTML_FILE_PATH = this.config_dict.SUPPORT_PAGE_DE_HTML_FILE_PATH;
      this.links.PRIVACY_POLICY_HTML_FILE_PATH = this.config_dict.PRIVACY_POLICY_DE_HTML_FILE_PATH;
      this.links.TERMS_HTML_FILE_PATH = this.config_dict.TERMS_DE_HTML_FILE_PATH;
      this.links.WELCOME_MESSAGE_HTML_FILE_PATH = this.config_dict.WELCOME_MESSAGE_DE_HTML_FILE_PATH;
      this.links.LEGAL_NOTICES_HTML_FILE_PATH = this.config_dict.LEGAL_NOTICES_DE_HTML_FILE_PATH;
    } else {
      this.links.SUPPORT_PAGE_HTML_FILE_PATH = this.config_dict.SUPPORT_PAGE_EN_HTML_FILE_PATH;
      this.links.PRIVACY_POLICY_HTML_FILE_PATH = this.config_dict.PRIVACY_POLICY_EN_HTML_FILE_PATH;
      this.links.TERMS_HTML_FILE_PATH = this.config_dict.TERMS_EN_HTML_FILE_PATH;
      this.links.WELCOME_MESSAGE_HTML_FILE_PATH = this.config_dict.WELCOME_MESSAGE_EN_HTML_FILE_PATH;
      this.links.LEGAL_NOTICES_HTML_FILE_PATH = this.config_dict.LEGAL_NOTICES_EN_HTML_FILE_PATH;
    }
    this.showFooters = true;
  }


  getData(name) {
    return name;
  }

  openAboutModal() {
    jQuery('#about-modal').modal('show');
  }
}
