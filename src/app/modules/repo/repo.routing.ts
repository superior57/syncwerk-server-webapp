import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// components
import { FileRevisionComponent } from './components/file-revision/file-revision.component';
import { HistoryTrashPreviewComponent } from './components/history-trash-preview/history-trash-preview.component';
import { FileDiffComponent } from './components/file-diff/file-diff.component';

const routes: Routes = [
  {
    path: 'text-diff/:repoID',
    component: FileDiffComponent
  },
  {
    path: 'file-revision/:repoID',
    component: FileRevisionComponent
  },
  {
    path: ':repoID/history/files',
    component: HistoryTrashPreviewComponent
  },
  {
    path: ':repoID/trash/files',
    component: HistoryTrashPreviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepoRoutingModule { }
