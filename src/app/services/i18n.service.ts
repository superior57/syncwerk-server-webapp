import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class I18nService {

  constructor(
    private cookieService: CookieService,
    private translate: TranslateService
  ) { }

  setLanguage(lang: string = 'en') {
    this.cookieService.put('lang', lang);
  }

  getLanguage() {
    let currentLang = this.cookieService.get('lang');
    if (!currentLang) {
      if (this.translate.getBrowserLang()) {
        currentLang = this.translate.getBrowserLang();
      } else {
        currentLang = 'en';
      }
    }
    return currentLang;
  }
}
