import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { ShareLinkService, MessageService, AdminService, I18nService } from '@services/index';
import { ActivatedRoute, Router } from '@angular/router';
import { Type, Action } from '@enum/index.enum';
import { CookieOptions, CookieService } from 'ngx-cookie';
import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-password-share-link',
  templateUrl: './password-share-link.component.html',
  styleUrls: ['./password-share-link.component.scss']
})
export class PasswordShareLinkComponent implements OnInit, AfterViewInit {
  @ViewChild('password') inputPasswordProtected;

  @Input() token: string;
  @Input() type: string;
  @Input() p: string = null;
  @Output() sendDataPassProtectedSuccess: EventEmitter<any> = new EventEmitter<any>();
  model: any;
  errorMessage: string;
  message: string;
  titlePasswordProtected: string;
  choosenLanguage = this.cookieService.get('lang');
  logoURL = '';
  logoTooltip = '';
  allowRetryToGetLogo = true;

  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private shareLinkService: ShareLinkService,
    private cookieService: CookieService,
    private adminService: AdminService,
    private translateService: TranslateService,
    private i18nService: I18nService
  ) { }

  ngOnInit() {
    this.initData();
    this.getLogoURL();
    this.getLogoTooltip();
  }

  ngAfterViewInit() {
    this.inputPasswordProtected.nativeElement.focus();
  }

  initData() {
    if (this.type === 'u/d') {
      this.choosenLanguage === 'en' ? this.titlePasswordProtected = 'Password Protected Share Upload Link' : this.titlePasswordProtected = 'Passwortgeschützter Link zum Hochladen von Freigaben';
    } else if (this.type === 'k') {
      this.choosenLanguage === 'en' ? this.titlePasswordProtected = 'Password Protected Share Kanban Project Link' : this.titlePasswordProtected = 'Passwortgeschützter gemeinsamer Kanban-Projektlink';
    } else {
      this.choosenLanguage === 'en' ? this.titlePasswordProtected = 'Password Protected Share Download Link' : this.titlePasswordProtected = 'Passwortgeschützter Share-Download-Link';
    }
    this.model = { password: '' };
    this.errorMessage = '';
  }

  submitPasswordProtected() {
    this.shareLinkService.postCheckPasswordProtected(this.token, this.model.password, this.type, this.p)
      .subscribe(resps => {
        this.inputPasswordProtected.nativeElement.focus();
        resps.data.password_protected ? this.errorMessage = resps.message : this.sendDataPassProtectedSuccess.emit(resps.data);
      }, error => console.error(error));
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translateService.use(data.value);
    this.choosenLanguage = data.value;
    this.initData();
  }

  getLogoURL() {
    this.logoURL = `/media/custom/mylogo.png?r=${new Date().getTime()}`;
  }

  getLogoTooltip() {
    this.adminService.getRestapiSettingsByKeys('SITE_TITLE').subscribe(resp => {
      this.logoTooltip = resp.data.config_dict.SITE_TITLE;
      if (this.logoTooltip === '') {
        this.logoTooltip = `Syncwerk Web-App`;
      }
    });
  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }
}
