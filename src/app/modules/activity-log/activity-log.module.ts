import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { ActivityLogsRoutingModule } from './activity-log.routing';

import { LogListComponent } from './pages/log-list/log-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ActivityLogsRoutingModule,
  ],
  declarations: [
    LogListComponent
  ]
})
export class ActivityLogModule { }
