import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { SharedModule } from '@shared/shared.module';

import { ClipboardModule } from 'ngx-clipboard';
import { MeetingsRoutingModule } from './meetings.routing'
import { MeetingListComponent } from './pages/meeting-list/meeting-list.component';
import { MeetingRecordingComponent } from './pages/meeting-recordings/meeting-recordings.component';
import { ModalCreateNewMeetingComponent } from './components/modal-create-new-meeting/modal-create-new-meeting.component';
import { ModalDeleteMeetingComponent } from './components/modal-delete-meeting/modal-delete-meeting.component';
import { ModalDeleteRecordingComponent } from './components/modal-delete-recording/modal-delete-recording.component';
import { ModalStartJoinMeetingComponent } from './components/modal-start-join-meeting/modal-start-join-meeting.component';
import { ModalMeetingFileChooserComponent } from './components/modal-meeting-file-chooser/modal-meeting-file-chooser.component';

@NgModule({
  imports: [
  	CommonModule,
    MomentModule,
  	FormsModule,
  	ReactiveFormsModule,
    SharedModule,
    MeetingsRoutingModule,
    ClipboardModule
  ],
  declarations: [
    MeetingListComponent,
    MeetingRecordingComponent,
    ModalCreateNewMeetingComponent,
    ModalDeleteMeetingComponent,
    ModalDeleteRecordingComponent,
    ModalStartJoinMeetingComponent,
    ModalMeetingFileChooserComponent
  ],
   entryComponents: [
   	ModalCreateNewMeetingComponent,
    ModalDeleteMeetingComponent,
    ModalDeleteRecordingComponent,
    ModalStartJoinMeetingComponent,
    ModalMeetingFileChooserComponent
   ]
})
export class MeetingsModule { }
