import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie';
import { Select2OptionData } from 'ng2-select2';

import { NonAuthenticationService, OtherService, I18nService } from '@services/index';

@Component({
  selector: 'app-cms-pages',
  templateUrl: './cms-pages.component.html',
  styleUrls: ['./cms-pages.component.scss']
})
export class CmsPagesComponent implements OnInit {

  cmsContent: any = {};
  isProcessing = true;

  cmsTypeFromPath = '';
  cmsType = '';
  cmsTitle = '';

  logoURL = '';
  logoTooltip = '';
  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];

  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };

  choosenLanguage = this.cookieService.get('lang');

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private nonAuthService: NonAuthenticationService,
    private otherService: OtherService,
    private i18nService: I18nService,
    private cookieService: CookieService,
  ) {
  }


  ngOnInit() {
    this.getLogoURL();
    this.getLogoTooltip();
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
    this.initCmsData(this.router.url);
    // this.activatedRoute.params.subscribe(params => {
    //   console.log('haha', params);
    //   // this.cmsTypeFromPath = params.cmsPageType;
    //   // this.initCmsData(this.cmsTypeFromPath);
    // });
  }

  getLogoTooltip() {
    this.nonAuthService.getRestapiSettingsByKeys('SITE_TITLE').subscribe(resp => {
      this.logoTooltip = resp.data.config_dict.SITE_TITLE;
      if (this.logoTooltip === '') {
        this.logoTooltip = `Syncwerk Web-App`;
      }
    });
  }

  initCmsData(cmsPageType) {
    switch (cmsPageType) {
      case '/legal':
        this.cmsType = 'legal';
        this.cmsTitle = this.translate.instant('STATIC_CMS.LEGAL_TITLE');
        break;
      case '/privacy':
        this.cmsType = 'privacy';
        this.cmsTitle = this.translate.instant('STATIC_CMS.PRIVACY_TITLE');
        break;
      case '/help':
        this.cmsType = 'support';
        this.cmsTitle = this.translate.instant('STATIC_CMS.SUPPORT_TITLE');
        break;
      case '/terms':
        this.cmsType = 'terms';
        this.cmsTitle = this.translate.instant('STATIC_CMS.TERMS_TITLE');
        break;
      case '/welcome':
        this.cmsType = 'welcome';
        this.cmsTitle = this.translate.instant('STATIC_CMS.WELCOME_TITLE');
        break;
      default:
        this.router.navigate(['/error', '404']);
        break;
    }
    this.getCmsContent(this.cmsType);
  }

  getCmsContent(key) {
    this.isProcessing = true;
    this.otherService.getCmsContent(key).subscribe(resp => {
      this.cmsContent = resp.data;
      this.isProcessing = false;
    }, err => {
      this.router.navigate(['/error', '404']);
    });
  }

  getLogoURL() {
    this.logoURL = this.nonAuthService.getPageLogoLink();
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translate.use(data.value).subscribe(result => {
      this.choosenLanguage = data.value;
      this.initCmsData(this.cmsTypeFromPath);
    });
  }

}
