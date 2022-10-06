
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


import { Http, Response } from '@angular/http';

import { AppConfig, OtherAPIs } from '../app.config';

import { environment } from '../../environments/environment';

@Injectable()
export class OtherService {

  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: OtherAPIs
  ) { }

  getLinkedDevicesList() {
    const url = `${this.api.API_DEVICES}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  unlinkDevice(deviceID: string, platform: string, wipeDevice: boolean = false) {
    const url = `${this.api.API_DEVICES}?platform=${platform}&device_id=${deviceID}&wipe_device=${wipeDevice}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  notificationCount() {
    const url = this.api.API_NOTIFICATION_COUNT;
    return this.http.get(url).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }

  getTopNotification() {
    const url = this.api.API_NOTIFICATION_TOP;
    return this.http.get(url).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }
  markAllSeenNotification() {
    const url = this.api.API_NOTIFICATION;
    return this.http.put(url, '').pipe(
      map((response: Response) => {
        return response.json();
      }));
  }

  getNotificationList(offset: number, limit: number) {
    const url = this.api.API_NOTIFICATION + '?offset=' + offset + '&limit=' + limit;
    return this.http.get(url).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }

  clearNotification() {
    const url = this.api.API_NOTIFICATION;
    return this.http.delete(url).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }

  markSeenNotification(id) {
    const url = this.api.API_NOTIFICATION_SINGLE;
    const formData: FormData = new FormData();
    formData.append('notification_id', id);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getResizedAvatarUser(userEmail: string, size: string) {
    const url = `${this.api.API_AVATARS_USER}${userEmail}/resized/${size}/`;
    return this.http.get(url).pipe(map((response: Response) => response.json()));
  }

  getCheckResource(url: string) {
    return this.http.get(url).pipe(map((response: Response) => response));
  }
  getHealthCheck() {
    const url = `ping`;
    return this.http.get(url).pipe(map((response: Response) => response.json()));
  }

  getCmsContent(cmsType) {
    const url = `cms/${cmsType}`;
    return this.http.get(url).pipe(map((response: Response) => response.json()));
  }
}
