import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MomentModule } from 'ngx-moment';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { MarkdownModule } from 'ngx-markdown';
import { CovalentTextEditorModule } from '@covalent/text-editor';
import { PdfViewerModule } from 'ng2-pdf-viewer';

// relative modules
import { RepoRoutingModule } from './repo.routing';
import { SharedModule } from '@shared/shared.module';

// components
import { FileRevisionComponent } from './components/file-revision/file-revision.component';
import { HistoryTrashPreviewComponent } from './components/history-trash-preview/history-trash-preview.component';
import { FileDiffComponent } from './components/file-diff/file-diff.component';


@NgModule({
  imports: [
    CommonModule,
    RepoRoutingModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
    SharedModule,
    MarkdownModule,
    CovalentTextEditorModule,
    PdfViewerModule
  ],
  declarations: [
    FileRevisionComponent,
    HistoryTrashPreviewComponent,
    FileDiffComponent
  ]
})
export class RepoModule { }
