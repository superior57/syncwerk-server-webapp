
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig, FilesAPI } from '../app.config';

@Injectable()
export class ShareLinkService {

  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: FilesAPI
  ) { }

  sendCodeAuditToEmail(token: string, email: string) {
    const url = `share-link-audit/`;
    const formData: FormData = new FormData();
    formData.append('token', token);
    formData.append('email', email);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  /**
   * used for the following API:
   * - POST /api3/d/{token}/
   * - POST /api3/f/{token}/
   * - POST /api3/u/d/{token}/
   * - POST /api3/d/{token}/files/
  */
  postCheckCodeAudit(typeShareLink: string, token: string, email: string, code: string, p: string = null) {
    const url = typeShareLink === 'd_files' ? `d/${token}/files/` : `${typeShareLink}/${token}/`;
    const options = {
      search: {}
    };
    if (typeShareLink === 'd_files') {
      options.search = {
        p: p
      };
    }
    const formData: FormData = new FormData();
    formData.append('email', email);
    formData.append('code', code);
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postCheckPasswordProtected(token: string, password: string, type: string, p: string = null) {
    const url = type === 'd_files' ? `d/${token}/files/` : `${type}/${token}/`;
    const formData: FormData = new FormData();
    const options = {
      search: {}
    };
    if (type === 'd_files') {
      options.search = {
        p: p
      };
    }
    formData.append('password', password);
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getShareDownloadLinkFile(token: string) {
    const url = `${this.api.API_DOWNLOAD_LINK_IN_FILE}${token}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getShareDownloadLinkFileDownloadLink(token: string) {
    const url = `${this.api.API_DOWNLOAD_LINK_IN_FILE}${token}/?dl=1`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getFileDownloadLinkFromShareFolderFilePreview(shareToken: string, filePath: string) {
    const url = `${this.api.API_DOWNLOAD_LINK_IN_DIR}${shareToken}/files/`;
    const options = {
      search: {
        dl: 1,
        p: filePath,
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  /**
   * @param typeAPI: string = {'u/d' || 'd' || 'f'}
   */
  getShareLink(token: string, typeAPI: string, query: string = null) {
    const url = query === null ? `${typeAPI}/${token}/` : `${typeAPI}/${token}/?${query}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getUrlShareLinkZipFolder(token: string, path: string) {
    const url = `share-link-zip-task/`;
    const options = {
      search: {
        share_link_token: token,
        path: path,
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  postGetLinkDownloadFileInDir(token: string, p: string) {
    const url = `d/${token}/files/`;
    const options = {
      search: {
        p: p,
        dl: 1
      }
    };
    const formData: FormData = new FormData();
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  /**
   * @param typeAPI: string = {'u/d' || 'd' || 'f'}
   * @param mode: string = {'list' || 'mode'}
   */
  getShareDownloadLinkDirectory(token: string, path: string, mode: string) {
    const url = `${this.api.API_DOWNLOAD_LINK_IN_DIR}${token}/`;
    const options = {
      search: {
        p: path,
        mode: mode,
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getPreviewFileShareLinkDir(token: string, p: string) {
    const url = `${this.api.API_DOWNLOAD_LINK_IN_DIR}${token}/files/`;
    const options = {
      search: {
        p: p,
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }
  getBatchDownloadLinks(token: string, path: string, dirents: string) {
    const url = `${this.api.API_DOWNLOAD_LINK_IN_DIR}${token}/batch/?path=${path}&dirents=${dirents}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getShareUploadLinkDetail(token: string) {
    const url = `${this.api.API_UPLOAD_URL_IN_DIR}${token}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getShareUploadLink(token: string, repo_id: string) {
    const url = `${this.api.API_UPLOAD_URL_IN_DIR}${token}/upload/`;
    const options = {
      search: {
        repo_id: repo_id
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getShareDownloadLinks(repoId: string) {
    const url = `${this.api.API_REPOS}${repoId}/download-shared-links/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getShareUploadLinks(repoId: string) {
    const url = `${this.api.API_REPOS}${repoId}/upload-shared-links/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  removeDownloadLink(repoId: string, token: string) {
    const url = `${this.api.API_REPOS}${repoId}/download-shared-links/${token}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  removeUploadLink(repoId: string, token: string) {
    const url = `${this.api.API_REPOS}${repoId}/upload-shared-links/${token}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }
}
