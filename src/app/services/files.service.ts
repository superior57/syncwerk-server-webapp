
import {map} from 'rxjs/operators';


import { Injectable } from '@angular/core';
import {Http, Response, Headers, ResponseContentType} from '@angular/http';

import { AppConfig, FilesAPI } from '../app.config';

import { environment } from '../../environments/environment';
import { userInfo } from 'os';
import {HttpHeaders, HttpClient, HttpHandler} from '@angular/common/http';

@Injectable()
export class FilesService {

  constructor(
      private http: Http,
      private httpc: HttpClient,
      private appConfig: AppConfig,
      private api: FilesAPI
  ) { }

  getURLByPath(path: string) {
    return environment.origin + path;
  }

  getRepo(type: string) {
    return this.http.get(`${this.api.API_REPOS}?type=${type}`).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  createNewFolder(file_info: any) {
    const url = this.api.API_REPOS;
    const body = file_info;
    return this.http.post(url, body).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  renameFolder(id: string, new_name: string, new_desc: string = '') {
    const url = this.api.API_REPOS + id + '/?op=rename';
    const body = {
      'repo_name': new_name,
      'repo_desc': new_desc
    };
    return this.http.post(url, body).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  renameFileFolder(repo_id: string, path: string, new_name: string, type: string) {
    const url = `${this.api.API_REPOS}${repo_id}/${type}/`;
    const body = {
      'operation': 'rename',
      'newname': new_name
    };
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.post(url, body, options).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  deleteEntry(type: string, repoId: string, path: string) {
    let url = `${this.api.API_REPOS}${repoId}/`;
    if (type) {
      url += `${type}/`;
    }
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
      }
    };
    return this.http.delete(url, options).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  // deleteFolder(repoId: string, path: string) {
  //   const url = `${this.api.API_REPOS}${repoId}${path}`;
  //   return this.http.delete(url).pipe(
  //     map((response: Response) => {
  //       const res = response.json();
  //       return res;
  //     }));
  // }

  transferFolder(repoId: string, owner: string) {
    const url = this.api.API_REPOS + repoId + '/owner';
    const body = {
      'owner': owner
    };
    return this.http.put(url, body).pipe(
        map((response: Response) => {
          return response.json();
        }));
  }

  getFolderHistoryLimit(repoId: string) {
    const url = this.api.API_REPOS + repoId + '/history-limit/';
    return this.http.get(url).pipe(
        map((response: Response) => {
          return response.json();
        }));
  }

  setFolderHistoryLimit(repoId: string, keepDays: string) {
    const url = this.api.API_REPOS + repoId + '/history-limit/';
    const body = {
      'keep_days': keepDays
    };
    return this.http.put(url, body).pipe(
        map((response: Response) => {
          return response.json();
        }));
  }

  createShareLink(data) {
    const url = this.api.API_SHARE_LINK;
    return this.http.post(url, data).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getLinkFileShare(folder_id: string, path: string) {
    const url = this.api.API_SHARE_LINK;
    const options = {
      search: {
        repo_id: folder_id,
        path: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteLinkFileShare(token: string) {
    const url = this.api.API_SHARE_LINK + '' + token + '/';
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  createUploadLink(data) {
    const url = this.api.API_UPLOAD_LINK;
    return this.http.post(url, data).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }
  getLinkUpload(folder_id: string, path: string) {
    const url = this.api.API_UPLOAD_LINK;
    const options = {
      search: {
        repo_id: folder_id,
        path: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteUploadLink(token: string) {
    const url = this.api.API_UPLOAD_LINK + '' + token + '/';
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  submitShareToUser(folder_id: string, data: any, path: string) {
    const url = this.api.API_REPOS + folder_id + '/dir/shared_items/';
    const formData: FormData = new FormData();
    formData.append('permission', data.permission);
    formData.append('share_type', data.share_type);
    formData.append('username', data.username);
    formData.append('allow_view_history', data.allow_view_history);
    formData.append('allow_view_snapshot', data.allow_view_snapshot);
    formData.append('allow_restore_snapshot', data.allow_restore_snapshot);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.put(url, formData, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getListSharedFolder(folder_id: string, type: string, path: string) {
    const url = this.api.API_REPOS + folder_id + '/dir/shared_items/';
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        share_type: type
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteUserSharedFolder(folder_id: string, email: string, path: string) {
    const url = this.api.API_REPOS + folder_id + '/dir/shared_items/';
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        share_type: 'user',
        username: email
      }
    };
    return this.http.delete(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  updatePermissionToUser(folder_id: string, data: any, path: string) {
    const url = this.api.API_REPOS + folder_id + '/dir/shared_items/';
    const formData: FormData = new FormData();
    formData.append('permission', data.permission);
    formData.append('share_type', data.share_type);
    formData.append('username', data.username);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        share_type: 'user',
        username: data.username,
      }
    };
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteGroupSharedFolder(folder_id: string, groupId: string, path: string) {
    const url = this.api.API_REPOS + folder_id + '/dir/shared_items/';
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        share_type: 'group',
        group_id: groupId,
      }
    };
    return this.http.delete(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  updatePermissionToGroup(folder_id: string, data: any, path: string) {
    const url = this.api.API_REPOS + folder_id + '/dir/shared_items/';
    const formData: FormData = new FormData();
    formData.append('permission', data.permission);
    formData.append('share_type', data.share_type);
    formData.append('group_id', data.group_id);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        share_type: 'group',
        group_id: data.group_id,
      }
    };
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  shareFolderToGroup(folder_id: string, data: any, path: string) {
    const url = this.api.API_REPOS + folder_id + '/dir/shared_items/';
    const formData: FormData = new FormData();
    formData.append('permission', data.permission);
    formData.append('share_type', data.share_type);
    formData.append('group_name', data.group_name);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.put(url, formData, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  searchEntries(term, type) {
    const url = type === 'user' ? 'search-user/?q=' : 'search-group/?q=';
    return this.http.get(url + term).pipe(map(res => res.json()));
  }

  sendShareLink(data) {
    const url = this.api.API_SEND_SHARE_LINK;
    return this.http.post(url, data).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }
  sendUploadLink(data) {
    const url = this.api.API_SEND_UPLOAD_LINK;
    return this.http.post(url, data).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getItemInFolder(id: string, path: string = '') {
    const url = `${this.api.API_REPOS}${id}/dir/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      },
    };
    return this.http.get(url,options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  createFileFolder(repo_id: string, path: string, type: string) {
    const url = `${this.api.API_REPOS}${repo_id}/${type}/`;
    const formData: FormData = new FormData();
    type === 'dir'
        ? formData.append('operation', 'mkdir')
        : formData.append('operation', 'create');
    return this.http.post(url, formData, {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      },
    }).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getUploadLink(repoId: string, path: string) {
    const url = `${this.api.API_REPOS}${repoId}/upload-link/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        from: 'web',
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  uploadFile(url, file, parent_dir, relative_path = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parent_dir', parent_dir);
    if (relative_path !== null && relative_path !== '') {
      formData.append('relative_path', relative_path);
    }
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getTrash(repoId: string, path: string = '') {
    const url = `${this.api.API_REPOS}${repoId}/trash/more/`;
    const options = {
      search: {
        path: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getTrashRepo(repoId: string, commitId: string, base: string, p: string) {
    const url = `${this.api.API_REPOS}${repoId}/trash/`;
    const options = {
      search: {
        p: p.replace(/\+/g, encodeURIComponent("+")),
        commit_id: commitId,
        base: base.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getTrashDir(repoId: string, commitId: string, base: string, p: string, dirPath: string) {
    const url = `${this.api.API_REPOS}${repoId}/trash/dir/`;
    const options = {
      search: {
        p: p.replace(/\+/g, encodeURIComponent("+")),
        commit_id: commitId,
        base: base.replace(/\+/g, encodeURIComponent("+")),
        dir_path: dirPath.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  removeTrash(repoId: string, day: string) {
    const url = `${this.api.API_REPOS}${repoId}/trash/clean/`;
    const formData: FormData = new FormData();
    formData.append('keep_days', day);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getParentPathFromArrayElementPath(arrayElementPath) {
    let path = '';
    const parent_path = arrayElementPath.slice(1).join('/');
    arrayElementPath.length <= 1 ? path = '/' : path = '/' + parent_path + '/';
    return path;
  }

  getDetails(repoId: string, type: string, path: string = null) {
    let url = `${this.api.API_REPOS}${repoId}`;
    // url += type === 'folder' ? '' : ((type === 'dir' ? '/dir/detail/?path=/' : '/file/?p=/') + path);
    const options = {
      search: {}
    };
    if (type === 'dir') {
      url += '/dir/detail/',
          options.search = {
            path: `/${path.replace(/\+/g, encodeURIComponent("+"))}`,
          };
    } else if (type === 'folder') {
      // skip
    } else {
      url += '/file/',
          options.search = {
            p: `/${path.replace(/\+/g, encodeURIComponent("+"))}`,
          };
    }
    return this.http.get(url, options).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  restoreTrash(repoId: string, type: string, commitId: string, path: string) {
    const url = `${this.api.API_REPOS}${repoId}/trash/${type}/restore/`;
    const formData: FormData = new FormData();
    formData.append('commit_id', commitId);
    formData.append('p', path);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  readTextFile(fileUrl) {
    return this.http.get(fileUrl).pipe(map(data => {
      return data;
    }));
  }

  getPreviewFileData(repoID: string, path: string, dl = '0', raw = '1') {
    const url = `${this.api.API_REPOS}${repoID}/file/preview/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getDownloadLink(repoID: string, path: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/preview/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        dl: 1
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }
  getDownloadLinks(repoID: string, parentPath: string, dirents: string){
    const url = `${this.api.API_REPOS}${repoID}/batch-download/?parent_dir=${parentPath}&dirents=${dirents}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }
  getFileEditHead(repoID: string, path: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/edit/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  submitFileEdit(repoID: string, path: string, head: string, content: string, encoding = 'auto') {
    const url = `${this.api.API_REPOS}${repoID}/file/edit/`;
    const formData: FormData = new FormData();
    formData.append('content', content);
    formData.append('encoding', encoding);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        head: head
      }
    };
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getHistoryPanigation(repoId: string, page: number = 1, perPage: number = 100) {
    const url = `${this.api.API_REPOS}${repoId}/history/?page=${page}&per_page=${perPage}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  /** --- View SnapShot --- */

  getSnapshotPanigation(repo_id: string, commit_id: string, path: string) {
    const url = `${this.api.API_REPOS}${repo_id}/history/snapshot/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        commit_id: commit_id
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  restoreHistorySnapShot(repo_id: string, commit_id: string, type: string, path: string) {
    const url = `${this.api.API_REPOS}${repo_id}/${type}/`;
    const formData: FormData = new FormData();
    formData.append('operation', 'revert');
    formData.append('commit_id', commit_id);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  restoreFolderSnapshot(repo_id: string, commit_id: string) {
    const url = `${this.api.API_REPOS}${repo_id}/history/snapshot/?commit_id=${commit_id}`;
    return this.http.put(url, {}).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getHistoryDownloadLink(repoID: string, objectID: string) {
    const url = `${this.api.API_REPO}${repoID}/${objectID}/download/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }



  markedFileStarred(repoID: string, path: string) {
    const url = `${this.api.API_STARRED_FILE}`;
    const formData: FormData = new FormData();
    formData.append('repo_id', repoID);
    formData.append('p', path);
    formData.append('p', path);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  removeFileStarred(repoID: string, path: string) {
    const url = `${this.api.API_STARRED_FILE}`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        repo_id: repoID
      }
    };
    return this.http.delete(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getListStarredFiles() {
    const url = `${this.api.API_STARRED_FILE}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getFileComments(repoID: string, path: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/comments/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  addFileComment(repoID: string, path: string, comment: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/comments/`;
    const formData: FormData = new FormData();
    formData.append('comment', comment);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  removeFileComment(repoID: string, commentID: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/comments/${commentID}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getFileRevisions(repoID: string, path: string, days = 7) {
    const url = `${this.api.API_REPOS}${repoID}/file/revisions/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        days: days
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  restoreFileRevision(repoID: string, path: string, commitID: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/restore/`;
    const formData: FormData = new FormData();
    formData.append('commit_id', commitID);
    formData.append('p', path);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getFileRevisionPreview(repoID: string, objectID: string, commitID: string, path: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/revision/preview/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        obj_id: objectID,
        commit_id: commitID,
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getFileDiff(repoID: string, path: string, commitID: string) {
    const url = `${this.api.API_REPOS}${repoID}/file/text_diff/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        commit: commitID
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getProfileEmail(email: string) {
    const url = `${this.api.API_USER}profile/${email}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getDetailFileHistory(repo_id: string, commit_id: string) {
    const url = `${this.api.API_REPOS}${repo_id}/history/changes/?commit_id=${commit_id}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getDeletedFolders() {
    const url = `${this.api.API_DELETED_REPOS}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  restoreDeletedFolders(repoID: string) {
    const url = `${this.api.API_DELETED_REPOS}`;
    const formData: FormData = new FormData();
    formData.append('repo_id', repoID);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getDirectoryCopy(repo_id: string, path: string, dir_only: string = '', all_dir: string = '') {
    const url = `${this.api.API_REPOS}${repo_id}/dirents/?path=${encodeURIComponent(path)}${dir_only}${all_dir}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getDetailsRepos(repo_id: string) {
    const url = `${this.api.API_REPOS}${repo_id}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  authPasswordFolder(repo_id: string, password: string, isAdminView?: boolean) {
    const url = `${isAdminView ? 'admin/folders/' : this.api.API_REPOS}${repo_id}/password/`;
    const formData: FormData = new FormData();
    formData.append('password', password);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  leaveShare(repo_id: string, path: string) {
    const url = `${this.api.API_BESHARED}${repo_id}${path}`;
    return this.http.delete(url).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  copyOrMoveFileFolder(data: any) {
    const url = `${this.api.API_COPY_MOVE_TASK}`;
    const formData: FormData = new FormData();
    formData.append('src_repo_id', data.src_repo_id);
    formData.append('src_parent_dir', data.src_parent_dir);
    formData.append('src_dirent_name', data.src_dirent_name);
    formData.append('dst_repo_id', data.dst_repo_id);
    formData.append('dst_parent_dir', data.dst_parent_dir);
    formData.append('operation', data.operation);
    formData.append('dirent_type', data.dirent_type);
    return this.http.post(url, formData).pipe(
        map((response: Response) => {
          const res = response.json();
          return res;
        }));
  }

  searchUserForSharing(repoID: string, path: string = null, q: string = '', include_self: number = 1) {
    const url = `${this.api.API_REPOS}${repoID}/dir/share_search_user/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        q: q,
        include_self: include_self,
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  searchGroupForSharing(repoID: string, path: string, q: string = '') {
    const url = `${this.api.API_REPOS}${repoID}/dir/share_search_group/`;
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+")),
        q: q
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  zipFolder(repoID: string, parentPath: string, dirents: string) {
    const url = `${this.api.API_REPOS}${repoID}/zip-task/?parent_dir=${parentPath}&dirents=${dirents}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getZipProgress(zipToken: String) {
    const url = `${this.api.API_ZIP_PROGRESS}?token=${zipToken}`;
    return this.http.get(url).pipe(map((resp: Response) => {
      const res = resp.json();
      return res;
    }));
  }

  changePasswordFolder(repo_id: string, oldPassword: string, newPassword: string) {
    const url = `${this.api.API_REPOS}${repo_id}/password/`;
    const formData: FormData = new FormData();
    formData.append('old_password', oldPassword);
    formData.append('new_password', newPassword);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteMultiFilesDirs(repoId: string, parentDir: string, direntsNamesArr: Array<any>) {
    const url = `${this.api.API_REPOS}${repoId}/dirents/delete/?parent_dir=${parentDir}`;
    const formData: FormData = new FormData();
    direntsNamesArr.forEach(item => formData.append('dirents_names', item));
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListPublicRepos() {
    const url = `${this.api.API_REPOS}public/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  /**
   * shareType = ['personal', 'group', 'public']
   */
  deleteSharedRepos(repoId: string, shareType: string) {
    const url = `${this.api.API_SHARED_REPOS}${repoId}/?share_type=${shareType}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  /**
   * body = {'name', 'desc', 'passwd', 'permission'}
   */
  createNewFolderOrg(body: any) {
    const url = `${this.api.API_REPOS}public/`;
    return this.http.post(url, body).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  updateSharedRepos(repoId: string, shareType: string, permission: string) {
    const url = `${this.api.API_SHARED_REPOS}${repoId}/`;
    const formData: FormData = new FormData();
    formData.append('share_type', shareType);
    formData.append('permission', permission);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getThumbnailImage(repoID: string, path: string, size: string, objID: string = '') {
    const url = `${this.api.API_REPOS}${repoID}/thumbnail/`;
    const options = {
      search: {
        p: path,
        obj_id: objID,
        size: size,
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response;
    }));
  }

  populateThumbnailImageLink(repoID: string, path: string, size: string, objID: string = '') {
    const handleObjID = objID !== '' ? `&obj_id=${objID}` : '';
    const url = `${this.api.API_REPOS}${repoID}/thumbnail/?p=${path}&size=${size}${handleObjID}`;
    return `${environment.api_endpoint}${url}`;
  }

  getReposAll() {
    const url = `${this.api.API_REPOS}`;
    return this.http.get(url).pipe(map((response: Response) => response.json()));
  }

  putLockUnlockFile(repoId, path, operation) {
    const url = `${this.api.API_REPOS}${repoId}/file/`;
    const formData: FormData = new FormData();
    // formData.append('p', path);
    formData.append('operation', operation);
    const options = {
      search: {
        p: path.replace(/\+/g, encodeURIComponent("+"))
      }
    };
    return this.http.put(url, {operation: operation}, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSearchFile(filterExtensions, searchQuery) {
    const url = `search/files/?ext=${filterExtensions}&s=${searchQuery}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }
  public getFile(url) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    const options = {
      headers: headers
    };
    // let _httpHandler: HttpHandler;
    // let http = new HttpClient(_httpHandler);
    return this.httpc.get(url, {...options, responseType: 'blob'} );
  }
}
