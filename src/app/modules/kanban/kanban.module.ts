import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { TagInputModule } from 'ngx-chips';
import { SharedModule } from '../shared/shared.module';
import { BoardsComponent } from './pages/boards/boards.component';
import { KanbanRoutingModule } from './kanban.routing';
import { AddProjectModalComponent } from './components/add-project-modal/add-project-modal.component';
import { RenameProjectModalComponent } from './components/rename-project-modal/rename-project-modal.component';
import { RemoveProjectModalComponent } from './components/remove-project-modal/remove-project-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectComponent } from './pages/project/project.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { EditBoardModalComponent } from './components/edit-board-modal/edit-board-modal.component';
import { DeleteBoardModalComponent } from './components/delete-board-modal/delete-board-modal.component';
import { ManageTaskModalComponent } from './components/manage-task-modal/manage-task-modal.component';
import { BsDatepickerModule, BsDropdownModule, CollapseModule, PopoverModule, TabsModule } from 'ngx-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ShareProjectModalComponent } from './components/share-project-modal/share-project-modal.component';


@NgModule({
  declarations: [
    BoardsComponent,
    AddProjectModalComponent,
    RenameProjectModalComponent,
    RemoveProjectModalComponent,
    ProjectComponent,
    EditBoardModalComponent,
    DeleteBoardModalComponent,
    ManageTaskModalComponent,
    ShareProjectModalComponent,
  ],
  imports: [
    CommonModule,
    ClipboardModule,
    TagInputModule,
    SharedModule,
    KanbanRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PopoverModule.forRoot(),
    CollapseModule.forRoot(),
    DragDropModule
  ],
  entryComponents: [
    AddProjectModalComponent,
    RenameProjectModalComponent,
    RemoveProjectModalComponent,
    EditBoardModalComponent,
    DeleteBoardModalComponent,
    ManageTaskModalComponent,
    ShareProjectModalComponent,
  ]
})
export class KanbanModule { }
