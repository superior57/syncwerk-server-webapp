import * as moment from 'moment';
import 'moment/min/locales';

import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { MessageService, OtherService, TitleService } from './services';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { I18nService, NonAuthenticationService } from './services';
import { CookieService } from 'ngx-cookie';
import { Router, NavigationEnd, ActivatedRoute} from '@angular/router';
import { filter } from 'rxjs/operators';


declare const jQuery: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  title = 'app';
  isMenu = false;

  constructor
    (
    private messageService: MessageService,
    private translate: TranslateService,
    private i18nService: I18nService,
    private nonAuthenService: NonAuthenticationService,
    private cookieService: CookieService,
    private otherServices: OtherService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService
  ) { }

  @HostListener('window:popstate', ['$event']) onpopstate() {
    const modals = jQuery('.modal');
    modals.attr('class', 'modal');
    modals.modal('hide');
  }

  ngOnInit() {
    const getLang = this.cookieService.get('lang');
    if (getLang === 'undifined') {
      moment.locale('en-gb');
    } else if (getLang === 'en') {
      moment.locale('en-gb');
    } else {
      moment.locale('de');
    }

    this.otherServices.getHealthCheck().subscribe(resp => {
      this.setFavicon();
      this.setDefaultLanguage();
      this.preventDragAndDrop();
    }, err => {
      if (err.status === 502) {
        this.router.navigate(['/error', '502']);
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    )
    .subscribe(() => {

      var rt = this.getChild(this.activatedRoute)

      rt.data.subscribe(data => {
        if(data.hasOwnProperty('title')){
          this.titleService.setTitle(data.title);
        }
      } )
    })
  }

  getChild(activatedRoute: ActivatedRoute) {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
 
  }

  preventDragAndDrop() {
    window.addEventListener('dragover', function (e) {
      e.preventDefault();
    }, false);
    window.addEventListener('drop', function (e) {
      e.preventDefault();
    }, false);
  }

  setDefaultLanguage() {
    const lang = this.i18nService.getLanguage();
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
    // this.cookieService.put('lang', 'en');
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }
  send(message: { text: string, respondEvent: string }) {
    this.messageService.broadcast(message.respondEvent, message.text);
  }

  subscribe() {
    this.subscription = this.messageService.subscribe('receiver', (payload) => {
      this.isMenu = !this.isMenu;
    });
  }
  unsubscribe() {
    this.subscription.unsubscribe();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
  switchLanguage(language: string) {
    this.translate.use(language);
  }

  setFavicon() {
    // getPageFaviconLink
    jQuery('link[rel="icon"]').attr('href', this.nonAuthenService.getPageFaviconLink);
    // // let faviconURL = `media/custom/favicon.ico?${new Date().getTime()}`;
    // this.otherServices.getCheckResource(faviconURL).subscribe(
    //   resp => {
    //     jQuery('link[rel="icon"]').attr('href', faviconURL);
    //   }, err => {
    //     faviconURL = `media/img/favicon.ico?${new Date().getTime()}`;
    //     jQuery('link[rel="icon"]').attr('href', faviconURL);
    //   }
    // );
  }
}
