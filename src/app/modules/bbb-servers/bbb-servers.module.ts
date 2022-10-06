import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { SharedModule } from '@shared/shared.module';

import { ClipboardModule } from 'ngx-clipboard';
import { BBBServersRoutingModule } from './bbb-servers.routing';
import { BbbServerListComponent } from './pages/bbb-server-list/bbb-server-list.component';
import { ModalAddEditBbbConnectionComponent } from './components/modal-add-edit-bbb-connection/modal-add-edit-bbb-connection.component';
import { ModalDeleteBbbServerComponent } from './components/modal-delete-bbb-server/modal-delete-bbb-server.component'

@NgModule({
  imports: [
    CommonModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    BBBServersRoutingModule,
    ClipboardModule
  ],
  declarations: [
    BbbServerListComponent,
    ModalAddEditBbbConnectionComponent,
    ModalDeleteBbbServerComponent,
  ],
  entryComponents: [
    ModalAddEditBbbConnectionComponent,
    ModalDeleteBbbServerComponent,
  ]
})
export class BBBServersModule { }
