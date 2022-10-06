import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { AppConfig } from 'app/app.config';
import { Action, Type } from '@enum/index.enum';
import { User } from 'app/Models/User.model';
import { AuthenticationService, MessageService, NonAuthenticationService, I18nService } from '@services/index';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '@services/shared.service';

declare var jQuery: any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  private subscription: Subscription;
  userInfo: User = new User('', '', '');
  isHide = true;
  isPageNotFound = false;
  maTheme: string = this.sharedService.maTheme;
  currentSysNotification: any = null;
  isSystemNotificationShow = false;

  constructor(
    private authenService: AuthenticationService,
    private appConfig: AppConfig,
    private cookieService: CookieService,
    private messageService: MessageService,
    private location: Location,
    private router: Router,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private nonAuthenService: NonAuthenticationService,
    private translate: TranslateService,
    private i18nService: I18nService,
  ) {

    // jQuery('#zip-progress-modal').modal('hide');
    this.authenService.checkLogin().subscribe(resp => {
      if (resp.data.force_passwd_change) {
        this.router.navigate(['change-password']);
      }
    });


    sharedService.maThemeSubject.subscribe((value) => {
      this.maTheme = value;
    });
    if (this.location.path() === '/files') {
      this.authenService.checkLogin().subscribe(resp => {
        if (resp.data.is_guest === true) {
          this.router.navigate(['files', 'shared-files']);
        } else {
          this.router.navigate(['folders']);
        }
      });
    }
    this.getUserInfo();
    this.subscribe();
  }

  ngOnInit() {
    const isShowSystemNotification = this.cookieService.get('showSystemNotification');
    this.isSystemNotificationShow = isShowSystemNotification ? true : false;
    this.getCurrentSystemNotification();
  }

  getCurrentSystemNotification() {
    this.nonAuthenService.getCurrentSystemNotification().subscribe(resp => {
      if (resp.data) {
        this.currentSysNotification = resp.data;
        if (this.cookieService.get('currentNotificationId') !== this.currentSysNotification.id.toString()) {
          this.cookieService.put('showSystemNotification', 'true');
          this.isSystemNotificationShow = true;
          this.cookieService.put('currentNotificationId', resp.data.id);
        }
      } else {
        this.currentSysNotification = null;
        this.isSystemNotificationShow = false;
      }
    });
  }

  closeNotification() {
    this.cookieService.remove('showSystemNotification');
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Main_Page, (payload) => {
      switch (payload.action) {
        case Action.Share_To_User_Get_User_Info:
          this.messageService.send(Type.Share_To_User, Action.Share_To_User_Get_User_Info, this.userInfo);
          break;
        case Action.Change_Avatar:
          this.getUserInfo();
          break;
        case Action.Page_Not_Found:
          this.isPageNotFound = payload.data;
          break;
        case Action.SystemNotificationUpdate:
          this.getCurrentSystemNotification();
          break;
        default:
          break;
      }
    });
  }

  getUserInfo() {
    this.authenService.userInfo()
      .subscribe(resp => {
        this.userInfo = new User(resp.data.name, resp.data.email, resp.data.department);
        let avatarUrl, newAvatarUrl;
        if (resp.data.avatar_url) {
          avatarUrl = resp.data.avatar_url.split('/');
          avatarUrl.splice(0, 3);
          newAvatarUrl = avatarUrl.join('/') + `?r=${new Date().getTime()}`;
        } else {
          newAvatarUrl = '../assets/images/user_default.png';
        }
        this.userInfo['avatar_url'] = newAvatarUrl;

        // set cookie for lang
        // resp.data.language = '';
        const getDefaultLanguageFromBrowser = navigator.languages && navigator.languages[0] || navigator.language;
        if (resp.data.language) {
          this.cookieService.put('lang', resp.data.language);
          this.i18nService.setLanguage(resp.data.language);
          this.translate.use(resp.data.language);
        } else {
          if (getDefaultLanguageFromBrowser.includes('en-') === true) {
            this.cookieService.put('lang', 'en');
            this.i18nService.setLanguage('en');
            this.translate.use('en');
          } else {
            this.cookieService.put('lang', 'de');
            this.i18nService.setLanguage('de');
            this.translate.use('de');
          }
        }
        // this.cookieService.put('lang', resp.data.language);
        // this.i18nService.setLanguage(resp.data.language);
        // this.translate.use(resp.data.language);
      }, error => {

      });
  }
}

