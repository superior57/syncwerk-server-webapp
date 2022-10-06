import { Injectable } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TitleService {
    constructor(
        private translate: TranslateService,
        private titleService: Title
    ) { }

    setTitle(data){
        let title = "";
        console.log("user service")
        for (const i in data){
            if (data[i].translate) {
            title += this.translate.instant(data[i].str);
            } else {
            title += data[i].str;
            }
            title += " ";
        }
        this.titleService.setTitle(title + " | " + this.translate.instant("APPLICATION_NAME")); 
        
    }
}