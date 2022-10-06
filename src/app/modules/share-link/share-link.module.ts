import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { RouterModule } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { MarkdownModule } from 'ngx-markdown';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap';

// relative modules
import { ShareLinkRoutingModule } from './share-link.routing';
import { SharedModule } from '@shared/shared.module';

// components
import { ShareUploadLinkComponent } from './components/share-upload-link/share-upload-link.component';
import { ShareLinkAuditComponent } from './components/share-link-audit/share-link-audit.component';
import { PasswordShareLinkComponent } from './components/password-share-link/password-share-link.component';
import { ShareDownloadLinkFileComponent } from './components/share-download-link-file/share-download-link-file.component';
import { ShareDownloadLinkDirectoryComponent } from './components/share-download-link-directory/share-download-link-directory.component';
import { ShareLinkPreviewComponent } from './components/share-link-preview/share-link-preview.component';
import {
  PreviewFileInDownloadLinkDirectoryComponent
} from './components/preview-file-in-download-link-directory/preview-file-in-download-link-directory.component';
import { RangeSizeGridModule } from '@modules/files/components/range-size-grid/range-size-grid.module';
import { ShareLinkMeetingComponent } from './components/share-link-meeting/share-link-meeting.component';
import { ShareLinkKanbanProjectComponent } from './components/share-link-kanban-project/share-link-kanban-project.component';
import { ShareLinkKanbanTaskModalComponent } from './components/share-link-kanban-task-modal/share-link-kanban-task-modal.component';
import { ShareMeetingStreamComponent } from './components/share-meeting-stream/share-meeting-stream.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DropzoneModule,
    ShareLinkRoutingModule,
    SharedModule,
    CodemirrorModule,
    MarkdownModule,
    PdfViewerModule,
    TabsModule.forRoot(),
    TooltipModule,
    RangeSizeGridModule
  ],
  declarations: [
    ShareUploadLinkComponent,
    ShareLinkAuditComponent,
    PasswordShareLinkComponent,
    ShareDownloadLinkFileComponent,
    ShareDownloadLinkDirectoryComponent,
    ShareLinkPreviewComponent,
    PreviewFileInDownloadLinkDirectoryComponent,
    ShareLinkMeetingComponent,
    ShareLinkKanbanProjectComponent,
    ShareLinkKanbanTaskModalComponent,
    ShareMeetingStreamComponent
  ],
  entryComponents: [
    ShareLinkKanbanTaskModalComponent,
  ]
})
export class ShareLinkModule { }
