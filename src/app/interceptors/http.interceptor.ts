
import { throwError as observableThrowError, Observable } from 'rxjs';

import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ConnectionBackend, Headers, Http, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';

import { environment } from '../../environments/environment';
import { I18nService } from '@services/i18n.service';

import { AuthenticationService } from '../services';


declare const jQuery: any;

@Injectable()
export class InterceptedHttp extends Http {
  public handleError = (error: Response) => {
    console.log('response', error);
    if (error.status === 401) {
      this.cookieService.remove('token');
      this.cookieService.remove('csrftoken');
      this.cookieService.remove('sessionid');
      this.router.navigate(['/login']);
      setTimeout(() => {
        jQuery('.modal-backdrop').remove();
        jQuery('modal-container').remove();
      }, 1000)
      // jQuery('bs-modal-backdrop').remove();
      // jQuery('modal-container').remove();
      // jQuery('.modal-backdrop').remove();
    }
    return observableThrowError(error);
  }

  public handleErrorWithoutRedirect = (error: Response) => {
    if (error.status === 401) {
      this.cookieService.remove('token');
      this.cookieService.remove('csrftoken');
      this.cookieService.remove('sessionid');
      setTimeout(() => {
        jQuery('.modal-backdrop').remove();
        jQuery('modal-container').remove();
      }, 1000)
      // jQuery('.modal-backdrop').remove();
      // jQuery('modal-container').remove();
    }
    return observableThrowError(error);
  }

  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions,
    private cookieService: CookieService,
    private router: Router,
    private i18nService: I18nService,
    private authService: AuthenticationService,
  ) {
    super(backend, defaultOptions);
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    if (url.indexOf('localhost:8082') !== -1 || url.indexOf('localhost/seafhttp') !== -1) {
      if (options && options.search && options.search['noRedirect']) {
        return super.get(url).pipe(catchError(this.handleErrorWithoutRedirect));
      }
      return super.get(url).pipe(catchError(this.handleError));
    }
    url = this.updateUrl(url);
    const reqOp = this.getRequestOptionArgs(options);
    if (options && options.search && options.search['noRedirect']) {
      return super.get(url, reqOp).pipe(catchError(this.handleErrorWithoutRedirect));
    }

    if (url.indexOf('strapi') !== -1) {
      return super.get(url).pipe(catchError(this.handleError));
    }

    return super.get(url, reqOp).pipe(catchError(this.handleError));
  }

  post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    if (url.indexOf('localhost:8082') !== -1 || url.indexOf('localhost/seafhttp') !== -1 || url.indexOf('localhost/accounts/') !== -1) {
      return super.post(url, body).pipe(catchError(this.handleError));
    }
    if (url.indexOf('strapi') !== -1) {
      return super.post(url, body).pipe(catchError(this.handleError));
    }
    url = this.updateUrl(url);
    return super.post(url, body, this.getRequestOptionArgs(options)).pipe(catchError(this.handleError));
  }

  put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    if (url.indexOf('strapi') !== -1) {
      return super.put(url, body).pipe(catchError(this.handleError));
    }
    url = this.updateUrl(url);
    return super.put(url, body, this.getRequestOptionArgs(options)).pipe(catchError(this.handleError));
  }

  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    if (url.indexOf('strapi') !== -1) {
    return super.delete(url).pipe(catchError(this.handleError));
    }
    url = this.updateUrl(url);
    return super.delete(url, this.getRequestOptionArgs(options)).pipe(catchError(this.handleError));
  }

  private updateUrl(req: string) {
    if (req.indexOf('strapi') !== -1) {
      return req;
    }

    if (req.indexOf('media/') === -1) {
      return environment.api_endpoint + req;
    }

    return environment.origin + req;
  }

  private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      const token = this.cookieService.get('token');
      options = this.headerOption(token);
    }
    return options;
  }

  private headerOption(token: string) {
    const headers = new Headers();
    headers.append('Authorization', 'Token ' + token);
    headers.append('Accept-Language', this.i18nService.getLanguage());
    const opts = new RequestOptions();
    opts.headers = headers;
    return opts;
  }
}
