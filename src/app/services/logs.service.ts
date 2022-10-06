
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig, FilesAPI } from '../app.config';

@Injectable()
export class LogsService {

  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: FilesAPI
  ) { }

  getActivityListLog() {
    const url = 'activity-logs/';
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getExportActivityListLogToCSV() {
    const url = 'activity-logs/export/';
    return this.http.get(url).pipe(map((response: Response) => {
      return response;
    }));
  }

  getUserActivityListLog(page: number = 1, perPage: number = 10,  q: string = '', formatStr: boolean = false) {
    const url = "user-activities/"
    const options = {
      search: {
        page: page,
        per_page: perPage,
        format_str: formatStr,
        q: encodeURIComponent(q)
      }
    };
    return this.http.get(url,options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getExportUserActivityListLogToCSV() {
    const url = 'user-activities/export/';
    return this.http.get(url).pipe(map((response: Response) => {
      return response;
    }));
  }

}
