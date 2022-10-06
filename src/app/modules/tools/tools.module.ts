import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// relative modules
import { SharedModule } from '@shared/shared.module';
import { ToolsRoutingModule } from './tools.routing';
import { DevicesComponent } from './components/devices/devices.component';
import { ModalUnlinkDeviceModule } from '@modules/tools/components/modal-unlink-device/modal-unlink-device.module';
import { TenantAdminComponent } from './pages/tenant-admin/tenant-admin.component';
import { ModalTenantAddMembersComponent } from './components/modal-tenant-add-members/modal-tenant-add-members.component';
import { ModalTenantRemoveMembersComponent } from './components/modal-tenant-remove-members/modal-tenant-remove-members.component';
import { ModalTenantUpdateQuotaComponent } from './components/modal-tenant-update-quota/modal-tenant-update-quota.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ToolsRoutingModule,
    ModalUnlinkDeviceModule
  ],
  declarations: [
    DevicesComponent,
    TenantAdminComponent,
    ModalTenantAddMembersComponent,
    ModalTenantRemoveMembersComponent,
    ModalTenantUpdateQuotaComponent,
  ],
  entryComponents: [
    ModalTenantAddMembersComponent,
    ModalTenantRemoveMembersComponent,
    ModalTenantUpdateQuotaComponent,
  ],
})
export class ToolsModule { }
