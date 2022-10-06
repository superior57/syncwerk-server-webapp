
import {map} from 'rxjs/operators';


import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { AuthenticationAPI } from '../app.config';

@Injectable()
export class AuthenticationService {

  constructor(
    private http: Http,
    private api: AuthenticationAPI
  ) { }

  login(username: string, password: string, captcha0: string = null, captcha1: string = null, remember_me: string = '0') {
    const url = this.api.API_LOGIN;
    const formData: FormData = new FormData();
    formData.append('login', username);
    formData.append('password', password);
    formData.append('remember_me', remember_me);
    if (captcha0 && captcha1) {
      formData.append('captcha_0', captcha0);
      formData.append('captcha_1', captcha1);
    }
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  logout() {
    localStorage.removeItem('url');
    const url = this.api.API_LOGOUT;
    return this.http.post(url, null).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }

  userInfo() {
    const url = this.api.API_USER_INFO;
    return this.http.get(url).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }

  userWithAvatarInfo() {
    const url = this.api.API_PROFILE;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  changePassword(oldPassword: string, newPassword: string, repeatPassword: string) {
    const url = this.api.API_CHANGE_PASSWORD;
    const body = { 'old_password': oldPassword, 'new_password1': newPassword, 'new_password2': repeatPassword };
    return this.http.post(url, body).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  changeUserInfo(newName: string, newDepartment: string, newPhone: string, newOpenOfficeMode: string) {
    const url = this.api.API_PROFILE;
    const body = { 'nickname': newName, 'department': newDepartment, 'telephone': newPhone, 'onlyoffice_open_mode':newOpenOfficeMode };
    return this.http.post(url, body).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  changeUserLanguage(lang) {
    const url = `${this.api.API_PROFILE}`;
    const formData = new FormData();
    formData.append('language', lang);
    return this.http.put(url, {language: lang}).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  deleteAccount() {
    const url = this.api.API_DELETE_ACCOUNT;
    return this.http.post(url, {}).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  changeUserAvatar(newAvatar) {
    const url = this.api.API_PROFILE_AVATAR;
    const formData = new FormData();
    formData.append('avatar', newAvatar);
    return this.http.post(url, formData).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  deleteUserAvatar() {
    return this.http.delete(this.api.API_PROFILE_AVATAR).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  changeDefaultFolder(repoId: string) {
    const url = this.api.API_CHANGE_DEFAULT_FOLDER;
    const body = { 'repo_id': repoId };
    return this.http.post(url, body).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  checkLogin() {
    const url = this.api.API_CHECK_LOGIN;
    return this.http.get(url).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  checkLoginWithoutRedirect() {
    const url = `${this.api.API_CHECK_LOGIN}`;
    return this.http.get(url, {
      search: {
        noRedirect: true,
      }
    }).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  activeAccountByEmail(activationKey) {
    const url = `active/${activationKey}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postCreateEmailChangeRequest(newEmail) {
    const url = 'profile/change-email-request/';
    const formData = new FormData();
    formData.append('new_email', newEmail);
    // const body = { new_email: newEmail };
    return this.http.post(url, formData).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  putResendConfirmationEmailForEmailChangeRequest(requestId) {
    const url = `profile/change-email-request/${requestId}/`;
    return this.http.put(url, null).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  deleteCancelEmailChangeRequest(requestId) {
    const url = `profile/change-email-request/${requestId}/`;
    return this.http.delete(url).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  postConfirmNewEmailToChange(confirmationData) {
    const url = 'profile/confirm-new-email/';
    const body = {
      request_owner: confirmationData.requestOwner,
      request_token: confirmationData.requestToken,
    };
    return this.http.post(url, body).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  postUpdateUserProfileBBBSetting(bbbSetting) {
    const url = 'profile/bbb/';
    const formData = new FormData();
    formData.append('bbb_server_url', bbbSetting.bbbUrl);
    formData.append('bbb_server_secret', bbbSetting.bbbSecret);
    formData.append('bbb_is_active', bbbSetting.isActive);
    // const body = { new_email: newEmail };
    return this.http.post(url, formData).pipe(
      map((response: Response) => {
        return response.json();
      }));
  }
}
