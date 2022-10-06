import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GroupsListPageComponent } from './pages/groups-list/groups-list.page';
import { SpecificGroupPageComponent } from './pages/specific-group/specific-group.page';
import { GroupManagementComponent } from './pages/group-management/group-management.component';
import { ChildFilesComponent } from '@shared/components/child-files/child-files.component';


const routes: Routes = [
  {   
    path: '', 
    component: GroupsListPageComponent ,
    data:{
      title: [
        {
          str: 'TITLE_PAGE.GROUPS',
          translate: true
        }
      ]
    }
  },
  // { path: ':id', component: SpecificGroupPageComponent },
  // { path: ':id/folders', component: SpecificGroupPageComponent},
  {
    path: ':id',
    children: [
      { path: 'group-management', component: GroupManagementComponent },
      {
        path: 'folders',
        children: [
          { path: '', component: SpecificGroupPageComponent, },
          { path: '**', component: ChildFilesComponent, }
        ],
      },
      // { path: 'folders/**', component: ChildFilesComponent },
      // { path: 'folders', component: SpecificGroupPageComponent },
      // { path: '**', component: ChildFilesComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
