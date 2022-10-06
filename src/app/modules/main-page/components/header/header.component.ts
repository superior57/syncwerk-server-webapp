
import { interval as observableInterval, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { MessageService, OtherService, NonAuthenticationService, NotificationService, AdminService } from '@services/index';
import { smoothlyMenu } from 'app/app.helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { flatten } from '@angular/compiler';
import { SharedService } from '@services/shared.service';
import { AuthenticationService } from '@services/authentication.service';
import { Type, Action } from '@enum/index.enum';

declare var jQuery: any;

@Component({
  host: { '(document:click)': 'onClick($event)' },
  // tslint:disable-next-line:component-selector
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('notif_icon') notif_icon: ElementRef;
  @ViewChild('notif_mark') notif_mark: ElementRef;
  @ViewChild('notif_dropdown') notif_dropdown: ElementRef;
  private name = 'header';
  private notif_on = false;

  unseen = 0;
  notif = [];
  isProcessing = false;
  allowRetryToGetLogo = true;
  logoURL = '';
  logoTooltip = '';
  userAvtUrl = '';
  maThemeModel = 'blue-grey';
  private subscription: Subscription;

  constructor(
    private messageService: MessageService,
    private otherService: OtherService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private myElement: ElementRef,
    private nonAuthenService: NonAuthenticationService,
    private noti: NotificationService,
    private sharedService: SharedService,
    private authenticate: AuthenticationService,
    private adminService: AdminService,
    private cookieService: CookieService,
  ) {
    sharedService.maThemeSubject.subscribe((value) => {
      this.maThemeModel = value;
    });
  }

  setTheme() {
    this.sharedService.setTheme(this.maThemeModel);
  }

  toggleNavigation(): void {
    jQuery('body').toggleClass('mini-navbar');
    smoothlyMenu();
  }

  ngOnInit() {
    this.subscribe();
    this.getLogoURL();
    this.getLogoTooltip();
    this.getNotificationCount();
    this.loadNotification();
    this.getUserAvatar();
    observableInterval(1000 * 60 * 3).subscribe(x => this.getNotificationCount());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Main_Page, (payload) => {
      switch (payload.action) {
        case Action.Change_Avatar:
          this.getUserAvatar();
          break;
        default:
          break;
      }
    });
  }

  getUserAvatar() {
    this.authenticate.userInfo().subscribe(resp => {
      if (!resp.data.avatar_url.includes('default.png')) {
        this.userAvtUrl = resp.data.avatar_url;
      } else {
        this.userAvtUrl = '';
      }
    });
  }

  getNotificationCount() {
    this.otherService.notificationCount().subscribe(resp => {
      if (resp.data.unseen_count !== this.unseen) {
        this.loadNotification();
      }
      this.unseen = resp.data.unseen_count;
    }, error => console.error(error));
  }

  notificationToggle() {
    this.notif_on = !this.notif_on;
  }

  loadNotification() {
    this.otherService.getTopNotification().subscribe(resp => {
      this.notif = resp.data.notifications;
      this.notif.forEach((notificationItem) => {
        if (notificationItem.msg_type === 'file_uploaded') {
          const routerLink = notificationItem.detail.uploaded_to.split('/');
          routerLink.splice(0, 1);
          notificationItem.detail.routerLink = ['/folders', notificationItem.detail.repo_id, ...routerLink];
        }
      });
    }, error => console.error(error));
  }

  notificationAvatar(notif) {
    if ((typeof (notif.msg_from) !== 'undefined') && (typeof (notif.msg_from.avatar_url) !== 'undefined')) {
      return notif.msg_from.avatar_url;
    }
    return notif.default_avatar_url;
  }

  markAllRead() {
    this.otherService.markAllSeenNotification().subscribe(resp => {
      this.unseen = 0;
      this.noti.showNotification('success', resp.message);
    }, error => console.error(error));
  }

  linkTo(type, value) {
    if (type === 'profile') {
      return 'user/profile/' + value;
    } else if (type === 'repo_share') {
      return 'folders/' + value;
    } else if (type === 'preview') {
      return 'preview/' + value.replace(/\//g, '%2F');
    } else if (type === 'group') {
      return 'files/groups/' + value;
    }
  }

  // Detect click on screen
  onClick(event) {
    // let clickedComponent = event.target;
    // let btnClick = false;
    // do {
    //   if (clickedComponent === this.notif_icon.nativeElement) { btnClick = true; }
    //   clickedComponent = clickedComponent.parentNode;
    // } while (clickedComponent);
    // // click on notification button
    // if (btnClick) {
    //   this.notificationToggle();
    //   if (this.notif_on) {
    //     jQuery('.scrollbar-macosx').scrollbar();
    //     this.loadNotification();
    //   } else {
    //     this.markAllRead();
    //   }
    //   // click on the outside of notification button -> close notif & mark read
    // } else {
    //   if (this.notif_on) {
    //     this.notificationToggle();
    //     this.markAllRead();
    //   }
    // }
  }
  clickOnDropdown(event) {
    if (event.target !== this.notif_mark.nativeElement) {
      event.stopPropagation();
    }
  }
  openFilePreview(repo_id, file_path) {
    this.router.navigate(['preview', repo_id], {
      queryParams: {
        p: file_path,
      }
    });
  }

  markRead(n) {
    if (!n.seen) {
      this.otherService.markSeenNotification(n.id).subscribe(resp => {
        n.seen = true;
        this.getNotificationCount();
      }, error => console.error(error));
    }
  }

  hideDropdown() {
    jQuery('#dropdown-notifications').parent().removeClass('show');
  }

  getLogoURL() {
    this.logoURL = this.nonAuthenService.getPageLogoLink();
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

  logout() {
    this.authenticate.logout()
      .subscribe(res => {
        this.cookieService.remove('showSystemNotification');
        this.cookieService.remove('currentNotificationId');
        this.router.navigate(['login']);
      }, error => {
        const status = error.status;
        switch (status) {
          case 401:
            this.cookieService.remove('showSystemNotification');
            this.cookieService.remove('currentNotificationId');
            this.router.navigate(['login']);
            break;
          default: console.error(error); break;
        }
      });
  }
}
