import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardsComponent } from './pages/boards/boards.component';
import { ProjectComponent } from './pages/project/project.component';

const routes: Routes = [
  {
    path: '',
    component: BoardsComponent,
      data: {
        title: [
          {
            str: 'KANBAN.TITLE',
            translate: true
          }
        ]
      }
  },
  {
    path: 'project/:projectId',
    component: ProjectComponent,
    children: [
      {
        path: ':boardId/:taskId',
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KanbanRoutingModule { }
