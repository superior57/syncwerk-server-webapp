import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MeetingListComponent } from './pages/meeting-list/meeting-list.component';
import { MeetingRecordingComponent } from './pages/meeting-recordings/meeting-recordings.component';

// relative modules
import { AuthGuard, RegisterGuard, CMSGuard } from '../../guard/index';

// components


const routes: Routes = [
  {
    path: '',
    component: MeetingListComponent,
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
    path: 'recordings/:meetingId',
    component: MeetingRecordingComponent,
    data:{
      title: [
        {
          str: 'TITLE_PAGE.RECORDINGS',
          translate: true
        }
      ]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeetingsRoutingModule { }
