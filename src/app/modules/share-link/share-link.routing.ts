import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { ShareUploadLinkComponent } from './components/share-upload-link/share-upload-link.component';
import { ShareDownloadLinkFileComponent } from './components/share-download-link-file/share-download-link-file.component';
import { ShareDownloadLinkDirectoryComponent } from './components/share-download-link-directory/share-download-link-directory.component';
import { ShareLinkMeetingComponent } from './components/share-link-meeting/share-link-meeting.component';
import { ShareLinkKanbanProjectComponent } from './components/share-link-kanban-project/share-link-kanban-project.component';
import {
  PreviewFileInDownloadLinkDirectoryComponent
} from './components/preview-file-in-download-link-directory/preview-file-in-download-link-directory.component';
import { ShareMeetingStreamComponent } from './components/share-meeting-stream/share-meeting-stream.component';


const routes: Routes = [
  {
    path: 'u/d/:token',
    component: ShareUploadLinkComponent,
  },
  {
    path: 'd/:token/files',
    component: PreviewFileInDownloadLinkDirectoryComponent,
    data: {
      name: 'public-share-file-preview'
    }
  },
  {
    path: 'd/:token',
    component: ShareDownloadLinkDirectoryComponent
  },
  {
    path: 'f/:token',
    component: ShareDownloadLinkFileComponent,
  },
  {
    path: 'm/:token',
    component: ShareLinkMeetingComponent,
  },
  {
    path: 'k/:token',
    component: ShareLinkKanbanProjectComponent,
  },
  {
    path: 's/:token',
    component: ShareMeetingStreamComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShareLinkRoutingModule { }
