import { Component, OnInit } from '@angular/core';
import { I18nService } from '@services/index';
@Component({
  selector: 'app-error-502',
  templateUrl: './error-502.component.html',
  styleUrls: ['./error-502.component.scss']
})
export class Error502Component implements OnInit {

  errorMessage = '';

  constructor(
    private i18nService: I18nService,
  ) { }

  ngOnInit() {
    this.setDefaultLanguage();
  }

  setDefaultLanguage() {
    const lang = this.i18nService.getLanguage();
    if (lang === 'de') {
      this.errorMessage = 'Der Server ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.';
    } else {
      this.errorMessage = 'Server currently not reachable, please try again later.';
    }
  }
}
