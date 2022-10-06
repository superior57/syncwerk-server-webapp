import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorDetailsComponent } from './components/error-details/error-details.component';

import { ModuleRouting } from './error-pages.routing';

import { Error404Component } from './pages/error-404/error-404.component';
import { Error502Component } from './pages/error-502/error-502.component';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  imports: [
    CommonModule,
    ModuleRouting,
    TranslateModule,
  ],
  declarations: [ErrorDetailsComponent, Error404Component, Error502Component]
})
export class ErrorPagesModule { }
