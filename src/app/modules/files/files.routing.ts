import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TrashComponent } from './components/trash/trash.component';
import { HistorysComponent } from './components/historys/historys.component';
import { ViewSnapshotComponent } from './components/view-snapshot/view-snapshot.component';
import { DeletedFoldersComponent } from './components/deleted-folders/deleted-folders.component';
import { RootFilesComponent } from '@shared/components/root-files/root-files.component';
import { ChildFilesComponent } from '@shared/components/child-files/child-files.component';
import { FavoritesPageComponent } from './pages/favorites/favorites.page';
import { LayoutFilesComponent } from './pages/layout-files/layout-files.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutFilesComponent
  },
  {
    path: 'folders',
    children: [
      { 
        path: '', 
        component: RootFilesComponent,
        data:{
          title: [
            {
              str: 'TITLE_PAGE.FILES',
              translate: true
            }
          ]
        }
      },
      { path: '**', component: ChildFilesComponent },
    ]
  },
  {
    path: 'files/shared-files',
    children: [
      { 
        path: '', 
        component: RootFilesComponent,
        data:{
          title: [
            {
              str: 'TITLE_PAGE.FILES',
              translate: true
            }
          ]
        }
      },
      { path: '**', component: ChildFilesComponent }
    ]
  },
  {
    path: 'files/org',
    children: [
      { 
        path: '', 
        component: RootFilesComponent, 
        data:{
          title: [
            {
              str: 'TITLE_PAGE.FILES',
              translate: true
            }
          ]
        }
      },
      { path: '**', component: ChildFilesComponent }
    ]
  },
  {
    path: 'files/shared-groups',
    children: [
      { 
        path: '', 
        component: RootFilesComponent,
        data:{
          title: [
            {
              str: 'TITLE_PAGE.FILES',
              translate: true
            }
          ]
        }
      },
      { path: '**', component: ChildFilesComponent }
    ]
  },
  { path: 'favorites', component: FavoritesPageComponent },
  { path: 'files/trash/:repoId', component: TrashComponent },
  { path: 'files/history', component: HistorysComponent },
  { path: 'files/history/view/:repoId', component: ViewSnapshotComponent },
  { path: 'files/deleted-folders', component: DeletedFoldersComponent },
  // { path: 'files/groups', loadChildren: '../groups/groups.module#GroupsModule' }
  { path: 'groups', loadChildren: '../groups/groups.module#GroupsModule' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilesRoutingModule { }
