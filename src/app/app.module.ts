// Import service, config
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseRequestOptions, Http, HttpModule, RequestOptions, XHRBackend } from '@angular/http';
import {
  AuthenticationService,
  FilesService,
  SearchService,
  NotificationService,
  CodeMirrorService,
  I18nService,
  OtherService,
  AdminService,
  GroupsService,
  NonAuthenticationService,
  ShareLinkService,
  MessageService,
  ShareAdminService,
  WikiService,
  LogsService,
  TitleService,
  MeetingsService,
  BBBService,
  KanbanService
} from './services/index';

// Import module
import { BrowserModule, Title } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MomentModule } from 'ngx-moment';
import { CookieModule, CookieService } from 'ngx-cookie';
import { SharedModule } from '@shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgxUploaderModule } from 'ngx-uploader';
import { ModalModule } from 'ngx-bootstrap/modal';

// Import component
import { AppComponent } from './app.component';
import { SharedService } from './services/shared.service';
import { AppConfig, AuthenticationAPI, FilesAPI, OtherAPIs, AdminAPI, ShareAdminAPI } from './app.config';
import { routing } from './app.routing';
import { AuthGuard, RegisterGuard, AdminGuard, CMSGuard, KanbanGuard } from './guard/index';
import { LoggedinGuard } from './guard/index';
import { httpFactory } from './interceptors/http.factory';

import { ZipProgressComponent } from './modules/shared/components/zip-progress/zip-progress.component';


// refactoring
import { ModuleRouting } from './modules/modules.routing';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    ZipProgressComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CookieModule.forRoot(),
    MomentModule,
    MarkdownModule.forRoot(),
    SharedModule,
    PerfectScrollbarModule,
    NgxUploaderModule,
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    // refactor
    ModuleRouting,
    routing,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: Http,
      useFactory: httpFactory,
      deps: [XHRBackend, RequestOptions, CookieService, Router, I18nService]
    },
    LoggedinGuard,
    BaseRequestOptions,
    AppConfig,
    AuthenticationAPI,
    FilesAPI,
    OtherAPIs,
    AdminAPI,
    MessageService,
    AuthenticationService,
    FilesService,
    SearchService,
    NotificationService,
    CodeMirrorService,
    I18nService,
    OtherService,
    AdminService,
    GroupsService,
    NonAuthenticationService,
    AuthGuard,
    RegisterGuard,
    AdminGuard,
    CMSGuard,
    KanbanGuard,
    ShareLinkService,
    ShareAdminService,
    WikiService,
    ShareAdminAPI,
    SharedService,
    LogsService,
    TitleService,
    Title,
    MeetingsService,
    BBBService,
    KanbanService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
