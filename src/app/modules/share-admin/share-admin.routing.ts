import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard, LoggedinGuard } from '@guard/index';

// components
import { FoldersPageComponent } from './pages/folders/folders.page';
import { LayoutShareAdminComponent } from '@modules/share-admin/components/layout-share-admin/layout-share-admin';

const routes: Routes = <Routes>[
  {
    path: '',
    component: LayoutShareAdminComponent,
    data:{
      title: [
        {
          str: 'TITLE_PAGE.SHARES',
          translate: true
        }
      ]
    }
    // children: [
    //   // {
    //   //   path: '',
    //   //   redirectTo: 'folders',
    //   //   pathMatch: 'full'
    //   // },
    //   { path: 'folders', component: FoldersPageComponent },
    //   { path: 'folders', component: FoldersPageComponent },
    //   { path: 'links', loadChildren: './pages/links/links.module#LinksModule' }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShareAdminRoutingModule { }
