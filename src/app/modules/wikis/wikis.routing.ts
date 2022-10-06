import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WikiListComponent } from './pages/wiki-list/wiki-list.component';
import { WikiPagesComponent } from './pages/wiki-pages/wiki-pages.component';

const routes: Routes = [
    {
      path: '',
      component: WikiListComponent,
      data:{
        title: [
          {
            str: 'WIKIS.WIKI_LIST.TITLE',
            translate: true
          }
        ]
      }
    },
    {
      path: ':slug',
      component: WikiPagesComponent
    }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class WikisRoutingModule { }
