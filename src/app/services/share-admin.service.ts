
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig, ShareAdminAPI } from 'app/app.config';


@Injectable()
export class ShareAdminService {

  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: ShareAdminAPI,
  ) { }

  getSharedFolders() {
    const url = `${this.api.API_SHARED_FOLDERS}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteDirSharedItems(repoId: string, p: string, shareTo: string, shareType: string) {
    const shareTypeValue = (shareType === 'personal' ? 'user' : 'group');
    const shareToKey = (shareType === 'personal' ? 'username' : 'group_id');
    const url = `${this.api.API_REPOS}${repoId}/dir/shared_items/?p=${p}&share_type=${shareTypeValue}&${shareToKey}=${shareTo}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postDirSharedItems(repoId: string, p: string, shareTo: string, shareType: string, permission: string) {
    const shareTypeValue = (shareType === 'personal' ? 'user' : 'group');
    const shareToKey = (shareType === 'personal' ? 'username' : 'group_id');
    const url = `${this.api.API_REPOS}${repoId}/dir/shared_items/?p=${p}&share_type=${shareTypeValue}&${shareToKey}=${shareTo}`;
    const formData: FormData = new FormData();
    formData.append('permission', permission);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSharedRepos() {
    const url = `${this.api.API_SHARED_REPOS}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteSharedRepos(repoId: string, shareType: string, shareToKey: string) {
    let queryShareToKey = '';
    if (shareType === 'personal') {
      queryShareToKey = `&user=${shareToKey}`;
    } else if (shareType === 'group') {
      queryShareToKey = `&group_id=${shareToKey}`;
    }
    const url = `${this.api.API_SHARED_REPOS}${repoId}/?share_type=${shareType}${queryShareToKey}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putSharedRepos(repoId: string, shareType: string, permission: string, shareToKey: string) {
    const url = `${this.api.API_SHARED_REPOS}${repoId}/`;
    const formData: FormData = new FormData();
    formData.append('share_type', shareType);
    formData.append('permission', permission);
    if (shareType === 'personal') {
      formData.append('user', shareToKey);
    } else if (shareType === 'group') {
      formData.append('group_id', shareToKey);
    }
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getAllDownloadLinks() {
    const url = `${this.api.API_SHARED_DOWNLOAD_LINKS}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getAllUploadLinks() {
    const url = `${this.api.API_SHARED_UPLOAD_LINKS}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  removeSharedDownloadLink(token) {
    const url = `${this.api.API_SHARED_DOWNLOAD_LINKS}${token}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  removeSharedUploadLink(token) {
    const url = `${this.api.API_SHARED_UPLOAD_LINKS}${token}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getShares() {
    const url = `${this.api.API_SHARES}`;
    return this.http.get(url).pipe(map((response: Response) => response.json()));
  }

  deleteShares(repoID: string, shareType: string, shareToKey: string) {
    let queryShareToKey = '';
    if (shareType === 'personal') {
      queryShareToKey = `&user=${shareToKey}`;
    } else if (shareType === 'group') {
      queryShareToKey = `&group_id=${shareToKey}`;
    }
    const url = `${this.api.API_SHARES}${repoID}/?share_type=${shareType}${queryShareToKey}`;
    return this.http.delete(url).pipe(map((response: Response) => response.json()));
  }
}
