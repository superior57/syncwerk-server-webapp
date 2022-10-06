import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MessageService, NonAuthenticationService, I18nService } from '@services/index';
import { smoothlyMenu } from 'app/app.helpers';
import { Router } from '@angular/router';

import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-secondary-header',
  templateUrl: './secondary-header.component.html',
  styleUrls: ['./secondary-header.component.scss']
})

export class SecondaryHeaderComponent implements OnInit {
  @Output() onChoosenLanguage = new EventEmitter();

  logoURL = '';
  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  choosenLanguage = 'en';
  allowRetryToGetLogo = true;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private nonAuthenService: NonAuthenticationService,
    private i18nService: I18nService,
    private translate: TranslateService
  ) { }

  toggleNavigation(): void {
    jQuery('body').toggleClass('mini-navbar');
    smoothlyMenu();
  }

  ngOnInit() {
    this.getLogoURL();
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
  }

  getLogoURL() {
    this.logoURL = this.nonAuthenService.getPageLogoLink();
  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translate.use(data.value);
    this.onChoosenLanguage.emit();
  }
}
