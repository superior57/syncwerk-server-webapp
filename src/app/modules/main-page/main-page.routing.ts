import { KanbanGuard } from './../../guard/kanban.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard, LoggedinGuard } from '@guard/index';

// components
import { LayoutComponent } from './components/layout/layout.component';
import { ProfileEmailComponent } from './components/profile-email/profile-email.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { CmsPagesComponent } from './pages/cms-pages/cms-pages.component';
import { DevicesComponent } from '@modules/tools/components/devices/devices.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: '../activity-log/activity-log.module#ActivityLogModule',
        data:{
          title: [
            {
              str: 'HOME.TITLE',
              translate: true
            }
          ]
        }
      },
      {
        path: '',
        loadChildren: '../files/files.module#FilesModule'
      },
      {
        path: 'manage/shares',
        loadChildren: '../share-admin/share-admin.module#ShareAdminModule'
      },
      {
        path: 'manage/groups',
        loadChildren: '../groups/groups.module#GroupsModule'
      },
      {
        path: 'manage/meeting-servers',
        loadChildren: '../bbb-servers/bbb-servers.module#BBBServersModule'
        // path: 'devices', component: DevicesComponent
      },
      {
        path: 'manage',
        loadChildren: '../tools/tools.module#ToolsModule'
        // path: 'devices', component: DevicesComponent
      },
      {
        path: 'meetings',
        loadChildren: '../meetings/meetings.module#MeetingsModule'
        // path: 'devices', component: DevicesComponent
      },
      // compatibility changes
      {
        path: 'settings',
        loadChildren: '../settings/settings.module#SettingsModule'
      },
      {
        path: 'admin',
        loadChildren: '../admin/admin.module#AdminModule'
      },
      {
        path: 'preview',
        loadChildren: '../file-preview/file-preview.module#FilePreviewModule'
      },
      {
        path: 'kanban',
        canActivate: [KanbanGuard],
        loadChildren: '../kanban/kanban.module#KanbanModule'
      }
      ,
      { path: 'user/profile/:email', component: ProfileEmailComponent },
      { path: 'notifications', component: NotificationListComponent },
      { path: 'repo', loadChildren: '../repo/repo.module#RepoModule' },
      { path: 'wikis', loadChildren: '../wikis/wikis.module#WikisModule' },
      { path: 'activity-logs', loadChildren: '../activity-log/activity-log.module#ActivityLogModule'},
      { path: 'cms/:cmsPageType', component: CmsPagesComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainPageRoutingModule { }
