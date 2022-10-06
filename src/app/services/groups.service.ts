
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig, FilesAPI } from '../app.config';

@Injectable()
export class GroupsService {

  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: FilesAPI
  ) { }

  getListGroups() {
    const url = this.api.API_GROUPS;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  createGroup(nameGroup: string) {
    const url = this.api.API_GROUPS;
    const formData: FormData = new FormData();
    formData.append('name', nameGroup);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getGroupRepos(idGroup: number, from: string = 'web') {
    const url = `${this.api.API_GROUPS}${idGroup}/repos/?from=${from}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getGroupInfo(idGroup: any) {
    const url = `${this.api.API_GROUPS}${idGroup}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getGroupDiscussions(idGroup: number, page: number = 1, per_page: number = 20) {
    const url = `${this.api.API_GROUPS}${idGroup}/discussions/?page=${page}&per_page=${per_page}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  createGroupDiscussions(idGroup: number, content: string) {
    const url = `${this.api.API_GROUPS}${idGroup}/discussions/`;
    const formData: FormData = new FormData();
    formData.append('content', content);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  removeGroupDiscussion(idGroup: number, discussID: number) {
    const url = `${this.api.API_GROUPS}${idGroup}/discussions/${discussID}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  createNewGroupFolder(file_info: any, idGroup) {
    const url = `${this.api.API_GROUPS}${idGroup}/repos/`;
    const body = file_info;
    return this.http.post(url, body).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }

  dismissGroup(idGroup: number) {
    const url = `${this.api.API_GROUPS}${idGroup}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  leaveGroup(idGroup: number, email: string) {
    const url = `${this.api.API_GROUPS}${idGroup}/members/${email}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getMembersInGroup(idGroup: number) {
    const url = `${this.api.API_GROUPS}${idGroup}/members/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  removeGroupMemer(idGroup: number, memberEmail: string) {
    const url = `${this.api.API_GROUPS}${idGroup}/members/${memberEmail}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  searchUserForGroupManagement(groupID: number, q: string) {
    const url = `${this.api.API_GROUPS}${groupID}/search_user/?q=${q}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  searchUser(q: string) {
    const url = `search-user/?q=${q}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  addMemberToGroupBulk(groupID: number, emails: string[]) {
    const url = `${this.api.API_GROUPS}${groupID}/members/bulk/`;
    const formData = new FormData();
    formData.append('emails', emails.join(','));
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  changeGroupMemberRole(groupID: number, memberEmail: string, isAdmin: boolean) {
    const url = `${this.api.API_GROUPS}${groupID}/members/${memberEmail}/`;
    const formData = new FormData();
    formData.append('is_admin', isAdmin.toString());
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  transferGroup(groupID: number, newOwnerEmail: string) {
    const url = `${this.api.API_GROUPS}${groupID}/`;
    const formData = new FormData();
    formData.append('owner', newOwnerEmail);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  renameGroup(groupID: number, newGroupName: string) {
    const url = `${this.api.API_GROUPS}${groupID}/`;
    const formData = new FormData();
    formData.append('name', newGroupName);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteRepoInGroup(idGroup, repoID) {
    const url = `${this.api.API_GROUPS}${idGroup}/repos/${repoID}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getBBBSetting(groupID: number) {
    const url = `${this.api.API_GROUPS}${groupID}/bbb/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }
  updateBBBSetting(groupID: number, data: any) {
    const url = `${this.api.API_GROUPS}${groupID}/bbb/`;
    const formData = new FormData();
    formData.append('bbb_server_url', data.bbb_server_url);
    formData.append('bbb_server_secret', data.bbb_server_secret);
    formData.append('bbb_is_active', data.bbb_is_active);

    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }
}
