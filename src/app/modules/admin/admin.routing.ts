import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '@guard/index';

import { LayoutAdminComponent } from './components/layout-admin/layout-admin.component';
import { SystemAdminSettingsComponent } from './pages/system-admin-settings/system-admin-settings.component';
import { SysAdminInfoPageComponent } from './pages/sys-admin-info/sys-admin-info.page';
import { DevicesComponent } from './pages/devices/devices.component';
import { SysAdminDevicesDesktopComponent } from './pages/sys-admin-devices-desktop/sys-admin-devices-desktop.component';
import { SysAdminFoldersAllComponent } from './pages/sys-admin-folders-all/sys-admin-folders-all.component';
import { SysAdminFoldersSystemComponent } from './pages/sys-admin-folders-system/sys-admin-folders-system.component';
import { SysAdminFoldersTrashComponent } from './pages/sys-admin-folders-trash/sys-admin-folders-trash.component';
import { SysAdminChildFoldersSystemComponent } from './pages/sys-admin-child-folders-system/sys-admin-child-folders-system.component';
import { UserDatabaseComponent } from './pages/user-database/user-database.component';
import { UserAdminComponent } from './pages/user-admin/user-admin.component';
import { UseradminInfoComponent } from './pages/useradmin-info/useradmin-info.component';
import { ChildFoldersAllComponent } from './pages/child-folders-all/child-folders-all.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { GroupFoldersComponent } from './pages/group-folders/group-folders.component';
import { GroupManagementComponent } from './pages/group-management/group-management.component';
import { SystemNotificationComponent } from './pages/system-notification/system-notification.component';
import { TenantListComponent } from './pages/tenant-list/tenant-list.component';
import { TenantUserListComponent } from './pages/tenant-user-list/tenant-user-list.component';
import { PublicShareLinksComponent } from './pages/public-share-links/public-share-links.component';
import { SudoComponent } from './pages/sudo/sudo.component';
import { AdminTrafficComponent } from './pages/admin-traffic/admin-traffic.component';
import { VirusScanComponent } from './pages/virus-scan/virus-scan.component';
import { EmailChangingRequestComponent } from './pages/email-changing-request/email-changing-request.component';
import { AuditlogComponent } from './pages/auditlog/auditlog.component';
import { MeetingListComponent } from './pages/meeting-list/meeting-list.component';
import { MeetingRecordingComponent } from './pages/meeting-recordings/meeting-recordings.component';
import { BbbServersComponent } from './pages/bbb-servers/bbb-servers.component';

const routes: Routes = [
    { path: '', redirectTo: 'settings', pathMatch: 'full' },
    // { path: 'devices', redirectTo: '/admin/devices/desktops', pathMatch: 'full' },
    // { path: 'folders', redirectTo: '/admin/folders/all-lib', pathMatch: 'full' },
    // { path: 'users', redirectTo: '/admin/users/all', pathMatch: 'full' },
    {
        path: '',
        component: LayoutAdminComponent,
        children: [
            {
                path: 'sudo',
                component: SudoComponent,
            },
            {
              path: 'virus-scan',
              component: VirusScanComponent,
              canActivate: [AdminGuard],
            },
            {
                path: 'settings',
                component: SystemAdminSettingsComponent,
                canActivate: [AdminGuard],
                data:{
                    title: [
                      {
                        str: 'TITLE_PAGE.SETTINGS',
                        translate: true
                      }
                    ]
                  }
            },
            {
                path: 'devices',
                component: DevicesComponent,
                canActivate: [AdminGuard],
                data:{
                    title: [
                      {
                        str: 'TITLE_PAGE.DEVICES',
                        translate: true
                      }
                    ]
                  }
                // children: [
                //   { path: 'mobiles', component: DevicesComponent },
                //   { path: 'desktops', component: SysAdminDevicesDesktopComponent },
                // ]
            },
            {
                path: 'folders',
                children: [
                    {   path: '',
                        component: SysAdminFoldersAllComponent,
                        canActivate: [AdminGuard],
                        data:{
                            title: [
                              {
                                str: 'TITLE_PAGE.ALL',
                                translate: true
                              },
                              {
                                str: 'TITLE_PAGE.FOLDERS',
                                translate: true
                              }
                            ]
                          }
                    },
                    {
                        path: 'system',
                        children: [
                            {   path: '',
                                component: SysAdminFoldersSystemComponent,
                                canActivate: [AdminGuard],
                                data:{
                                    title: [
                                      {
                                        str: 'TITLE_PAGE.SYSTEM_LIB',
                                        translate: true
                                      }
                                    ]
                                  }
                            },
                            { path: '**', component: SysAdminChildFoldersSystemComponent, canActivate: [AdminGuard], },
                        ]
                    },
                    {   path: 'trash',
                        component: SysAdminFoldersTrashComponent,
                        canActivate: [AdminGuard],
                        data:{
                            title: [
                              {
                                str: 'TITLE_PAGE.FOLDERS',
                                translate: true
                              },
                              {
                                str: 'TITLE_PAGE.TRASH_LIB',
                                translate: true
                              }
                            ]
                          }
                    },
                    { path: '**', component: ChildFoldersAllComponent, canActivate: [AdminGuard], }
                ]
            },
            {
                path: 'users',
                children:  [
                    { path: 'info/:email', redirectTo: 'info/:email/profile', pathMatch: 'prefix'},
                    { path: 'info/:email/:tab_name', component: UseradminInfoComponent, canActivate: [AdminGuard], },
                    {   path: 'all',
                        component: UserDatabaseComponent,
                        canActivate: [AdminGuard],
                        data:{
                            title: [
                              {
                                str: 'TITLE_PAGE.USERS',
                                translate: true
                              }
                            ]
                          }
                    },
                    { path: 'admins', component: UserAdminComponent, canActivate: [AdminGuard], }
                ]
            },
            {
                path: 'groups',
                component: GroupsComponent,
                canActivate: [AdminGuard],
                data:{
                    title: [
                      {
                        str: 'ADMIN.GROUPS.TITLE.GROUP_LIST',
                        translate: true
                      }
                    ]
                  }
            },
            {
                path: 'groups/:groupId/folders',
                component: GroupFoldersComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'groups/:groupId/management',
                component: GroupManagementComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'sysnotifications',
                component: SystemNotificationComponent,
                canActivate: [AdminGuard],
                data:{
                    title: [
                      {
                        str: 'ADMIN.NOTIFICATIONS.TITLE.NOTIFICATION_LIST',
                        translate: true
                      }
                    ]
                }
            },
            {
                path: 'tenants',
                component: TenantListComponent,
                canActivate: [AdminGuard],
                data:{
                    title: [
                      {
                        str: 'ADMIN.INSTITUTIONS.TITLE.INSTITUTION_LIST',
                        translate: true
                      }
                    ]
                }
            },
            {
                path: 'tenants/:instId',
                component: TenantUserListComponent,
                canActivate: [AdminGuard],
            },
            {
                path: 'shares',
                component: PublicShareLinksComponent,
                canActivate: [AdminGuard],
                data:{
                    title: [
                      {
                        str: 'ADMIN.PUBLIC_SHARES.TITLE.LINK_LIST',
                        translate: true
                      }
                    ]
                  }
            },
            {
              path: 'traffic',
              component: AdminTrafficComponent,
              canActivate: [AdminGuard],
              data:{
                title: [
                  {
                    str: 'ADMIN.TRAFFIC.TITLE.TRAFFIC_HEADER',
                    translate: true
                  }
                ]
              }
            },
            {
              path: 'email-change-request',
              component: EmailChangingRequestComponent,
              canActivate: [AdminGuard],
              data:{
                title: [
                  {
                    str: 'ADMIN.EMAIL_CHANGES.TITLE',
                    translate: true
                  }
                ]
              }
            },
            {
              path: 'auditlog',
              component: AuditlogComponent,
              canActivate: [AdminGuard],
              data:{
                title: [
                  {
                    str: 'TITLE_PAGE.AUDIT_LOG',
                    translate: true
                  }
                ]
              }
            },
            {
              path: 'meetings',
              component: MeetingListComponent,
              canActivate: [AdminGuard],
              data:{
                title: [
                  {
                    str: 'TITLE_PAGE.MEETINGS',
                    translate: true
                  }
                ]
              }
            },
            {
              path: 'meetings/recordings/:meetingId',
              component: MeetingRecordingComponent,
              canActivate: [AdminGuard],
              data:{
                title: [
                  {
                    str: 'TITLE_PAGE.RECORDINGS',
                    translate: true
                  }
                ]
              }
            },
            {
              path: 'meeting-servers',
              component: BbbServersComponent,
              canActivate: [AdminGuard],
              data:{
                title: [
                  {
                    str: 'TITLE_PAGE.BBB_SERVER',
                    translate: true
                  }
                ]
              }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
