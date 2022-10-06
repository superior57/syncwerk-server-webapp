
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


import { Http, Response } from '@angular/http';

import { AppConfig, OtherAPIs } from '../app.config';

import { environment } from '../../environments/environment';

@Injectable()
export class WikiService {
    constructor(
        private http: Http,
        private appConfig: AppConfig,
        private api: OtherAPIs
    ) { }

    getListWiki() {
        const url = `wikis/`;
        return this.http.get(url).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    postCreateNewWiki(wikiName) {
        const url = `wikis/`;
        const formData = new FormData();
        formData.append('name', wikiName);
        formData.append('use_exist_repo', 'false');
        return this.http.post(url, formData).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    postCreateNewWikiFromExistingFolder(repoId) {
        const url = `wikis/`;
        const formData = new FormData();
        formData.append('repo_id', repoId);
        formData.append('use_exist_repo', 'true');
        return this.http.post(url, formData).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    postRenameWiki(wikiSlug, wikiNewName) {
        const url = `wikis/${wikiSlug}/`;
        const formData = new FormData();
        formData.append('wiki_name', wikiNewName);
        return this.http.post(url, formData).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    deleteWiki(wikiSlug) {
        const url = `wikis/${wikiSlug}/`;
        const formData = new FormData();
        return this.http.delete(url).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    getWikiInfo(wikiSlug) {
        const url = `wikis/${wikiSlug}/pages/`;
        return this.http.get(url).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    postCreateNewWikiPage(wikiSlug, pageName) {
        const url = `wikis/${wikiSlug}/pages/`;
        const formData = new FormData();
        formData.append('name', pageName);
        return this.http.post(url, formData).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }
}
