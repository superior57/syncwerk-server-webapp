import { Injectable } from '@angular/core';
import {FilesAPI} from '../app.config';
import {Http, Response, Headers, ResponseContentType} from '@angular/http';
import {HttpHeaders, HttpClient, HttpHandler} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable()
export class SearchService {

    constructor(
        private api: FilesAPI,
        private http: Http,

    ) { }

    searchInFolder(id: string, path: string = '', query) {
        const url = `${this.api.API_SEARCH}${id}/dir/`;
        const options = {
            search: {
                p: path.replace(/\+/g, encodeURIComponent("+")),
                q: query
            },
        };
        return this.http.get(url,options).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }
}
