import { Http, RequestOptions, XHRBackend } from '@angular/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { InterceptedHttp } from './http.interceptor';
import {I18nService, AuthenticationService} from '@services/index';

export function httpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, cookieService: CookieService, router: Router, i18nService: I18nService, authService: AuthenticationService): Http {
  return new InterceptedHttp(xhrBackend, requestOptions, cookieService, router, i18nService, authService);
}
