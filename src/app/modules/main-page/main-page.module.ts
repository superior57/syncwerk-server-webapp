import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// relative modules
import { MainPageRoutingModule } from './main-page.routing';
import { SharedModule } from '../shared/shared.module';

// components
import { HeaderComponent } from './components/header/header.component';
// import { FooterComponent } from './components/footer/footer.component';
import { SideMenuBarComponent } from './components/side-menu-bar/side-menu-bar.component';
import { UploadProcessPopupComponent } from './components/upload-process-popup/upload-process-popup.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ProfileEmailComponent } from './components/profile-email/profile-email.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CmsPagesComponent } from './pages/cms-pages/cms-pages.component';
import {BsDropdownModule, ButtonsModule} from 'ngx-bootstrap';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MainPageRoutingModule,
    SharedModule,
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  declarations: [
    HeaderComponent,
    // FooterComponent,
    SideMenuBarComponent,
    UploadProcessPopupComponent,
    ProfileEmailComponent,
    LayoutComponent,
    NotificationListComponent,
    DashboardComponent,
    CmsPagesComponent,
  ]
})
export class MainPageModule { }
