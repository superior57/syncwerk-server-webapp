
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig, FilesAPI } from '../app.config';
import { environment } from '../../environments/environment';

@Injectable()
export class NonAuthenticationService {

  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: FilesAPI
  ) { }

  postPasswordReset(email: string) {
    const url = `password/reset/`;
    const formData: FormData = new FormData();
    formData.append('email', email);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getConfirmPasswordReset(uidb36_token: string) {
    const url = `password/reset/confirm/${uidb36_token}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postCofirmPasswordReset(uidb36_token: string, newPassword: string, confirmPassword: string) {
    const url = `password/reset/confirm/${uidb36_token}/`;
    const formData: FormData = new FormData();
    formData.append('new_password1', newPassword);
    formData.append('new_password2', confirmPassword);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postRegisterUser(email: string, password1: string, password2: string) {
    const url = `register`;
    const formData: FormData = new FormData();
    formData.append('email', email);
    formData.append('password1', password1);
    formData.append('password2', password2);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSettingsByKeys(keys: string) {
    const url = `settings/by-keys?keys=${keys}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }


  getRestapiSettingsByKeys(keys: string) {
    const url = `settings/restapi/by-keys?keys=${keys}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }


  getLoginConfig() {
    const url = `login-config`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getCaptcha() {
    const url = `get-captcha`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getCurrentSystemNotification() {
    const url = `current-system-notification/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getAvailableFeatures() {
    const url = `features/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }


  getPageLogoLink() {
    return `${environment.api_endpoint}page-logo/`;
  }

  getPageFaviconLink() {
    return `${environment.api_endpoint}page-favicon/`;
  }

  getNotifyUploadFileDone(fileName: string, repoId: string, shareUploadLinkToken: string, path: string) {
    const url = `upload-file-done/?fn=${encodeURIComponent(fileName)}&repo_id=${repoId}&token=${shareUploadLinkToken}&p=${encodeURIComponent(path)}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

}
