import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeModule } from 'ng2-tree';
import { SharedModule } from '@shared/shared.module';
import { SettingsRoutingModule } from './settings.routing';

import { ModalChangePasswordComponent } from './components/modal-change-password/modal-change-password.component';
import { DeleteAccountModalComponent } from './components/delete-account-modal/delete-account-modal.component';
import { ChooseDefaultFolderModalComponent } from './components/choose-default-folder-modal/choose-default-folder-modal.component';
import { LayoutSettingsComponent } from './components/layout-settings/layout-settings.component';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule,
    SharedModule
  ],
  declarations: [
    ModalChangePasswordComponent,
    DeleteAccountModalComponent,
    ChooseDefaultFolderModalComponent,
    LayoutSettingsComponent,
  ]
})
export class SettingsModule { }
