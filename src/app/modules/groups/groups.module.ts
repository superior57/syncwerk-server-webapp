import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { GroupsRoutingModule } from './groups.routing';
import { SharedModule } from '@shared/shared.module';

import { GroupsListPageComponent } from './pages/groups-list/groups-list.page';
import { ModalCreateNewGroupComponent } from './components/modal-create-new-group/modal-create-new-group.component';
import { SpecificGroupPageComponent } from './pages/specific-group/specific-group.page';
import { RenameGroupComponent } from './components/rename-group/rename-group.component';
import { TransferGroupComponent } from './components/transfer-group/transfer-group.component';
import { ImportMembersModalComponent } from './components/import-members-modal/import-members-modal.component';
import { ManageGroupMembersComponent } from './components/manage-group-members/manage-group-members.component';
import { DismissLeaveGroupModalComponent } from './components/dismiss-leave-group-modal/dismiss-leave-group-modal.component';
import { DiscussionsGroupComponent } from './components/discussions-group/discussions-group.component';
import { GroupManagementComponent } from './pages/group-management/group-management.component';
import { AddMembersModalComponent } from './components/add-members-modal/add-members-modal.component';
import { ShareExistingFolderComponent } from './components/share-existing-folder/share-existing-folder.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    GroupsRoutingModule,
    MomentModule
  ],
  declarations: [
    // pages
    GroupsListPageComponent,
    SpecificGroupPageComponent,

    // components
    ModalCreateNewGroupComponent,
    RenameGroupComponent,
    TransferGroupComponent,
    ImportMembersModalComponent,
    ManageGroupMembersComponent,
    DismissLeaveGroupModalComponent,
    DiscussionsGroupComponent,
    GroupManagementComponent,
    AddMembersModalComponent,
    ShareExistingFolderComponent,
  ],
  entryComponents: [
    AddMembersModalComponent,
    ShareExistingFolderComponent,
  ],
})
export class GroupsModule { }
