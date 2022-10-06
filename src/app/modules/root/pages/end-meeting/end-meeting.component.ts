import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie';
import { Select2OptionData } from 'ng2-select2';

import { I18nService, NonAuthenticationService } from '@services/index';

@Component({
  selector: 'app-end-meeting',
  templateUrl: './end-meeting.component.html',
  styleUrls: ['./end-meeting.component.scss']
})
export class EndMeetingComponent implements OnInit {

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

  redirectLocation = this.cookieService.get('end_meeting_redirect_location');

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private i18nService: I18nService,
    private cookieService: CookieService,
    private nonAuthService: NonAuthenticationService,
  ) { }

  ngOnInit() {
    this.getLogoURL();
    this.getLogoTooltip();
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
    if (this.redirectLocation) {
      setTimeout(() => {
        this.cookieService.remove('end_meeting_redirect_location');
        window.location.href = this.redirectLocation;
      }, 2000);
    }
  }

  getLogoTooltip() {
    this.nonAuthService.getRestapiSettingsByKeys('SITE_TITLE').subscribe(resp => {
      this.logoTooltip = resp.data.config_dict.SITE_TITLE;
      if (this.logoTooltip === '') {
        this.logoTooltip = `Syncwerk Web-App`;
      }
    });
  }

  getLogoURL() {
    this.logoURL = this.nonAuthService.getPageLogoLink();
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translate.use(data.value);
  }
}
