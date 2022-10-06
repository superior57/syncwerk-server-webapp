import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig, FilesAPI } from '../app.config';

@Injectable()
export class BBBService {
  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: FilesAPI
  ) { }

  getListBBBServer() {
    const url = `bbb-settings/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  postAddBBBServer(bbbServerInfo) {
    const url = `bbb-settings/`;
    const formData = new FormData();
    formData.append('bbb_config_name', bbbServerInfo.bbbServerName)
    formData.append('bbb_server', bbbServerInfo.bbbServer)
    formData.append('bbb_secret', bbbServerInfo.bbbServerSecret)
    formData.append('live_stream_token', bbbServerInfo.liveStreamToken)
    formData.append('live_stream_server', bbbServerInfo.liveStreamServer)
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getBBBServerById(id) {
    const url = `bbb-settings/${id}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  putEditBBBServer(id, bbbServerInfo) {
    const url = `bbb-settings/${id}/`;
    const formData = new FormData();
    formData.append('bbb_config_name', bbbServerInfo.bbbServerName)
    formData.append('bbb_server', bbbServerInfo.bbbServer)
    formData.append('bbb_secret', bbbServerInfo.bbbServerSecret)
    formData.append('live_stream_token', bbbServerInfo.liveStreamToken)
    formData.append('live_stream_server', bbbServerInfo.liveStreamServer)
    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteBBBServer(id) {
    const url = `bbb-settings/${id}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

}
