import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

import { ClipboardModule } from 'ngx-clipboard';
import { AdminRoutingModule } from './admin.routing';
import { SharedModule } from '@shared/shared.module';

import { LayoutAdminComponent } from './components/layout-admin/layout-admin.component';
import { SystemAdminSettingsComponent } from './pages/system-admin-settings/system-admin-settings.component';
import { SysAdminInfoPageComponent } from './pages/sys-admin-info/sys-admin-info.page';
import { DevicesComponent } from './pages/devices/devices.component';
import { UnlinkDeviceModalComponent } from './components/unlink-device-modal/unlink-device-modal.component';
import { SysAdminDevicesDesktopComponent } from './pages/sys-admin-devices-desktop/sys-admin-devices-desktop.component';
import { TitleDevicesComponent } from './components/title-devices/title-devices.component';
import { SysAdminFoldersAllComponent } from './pages/sys-admin-folders-all/sys-admin-folders-all.component';
import {
  ModalFoldersAllDeleteItemComponent
} from './components/modal-folders-all-delete-item/modal-folders-all-delete-item.component';
import { SharesFoldersAllModalComponent } from './components/shares-folders-all-modal/shares-folders-all-modal.component';
import { ShareToUserFoldersAllComponent } from './components/share-to-user-folders-all/share-to-user-folders-all.component';
import { ShareToGroupFoldersAllComponent } from './components/share-to-group-folders-all/share-to-group-folders-all.component';
import { ModalFoldersAllCreateNewComponent } from './components/modal-folders-all-create-new/modal-folders-all-create-new.component';
import { SysAdminFoldersSystemComponent } from './pages/sys-admin-folders-system/sys-admin-folders-system.component';
import { SysAdminFoldersTrashComponent } from './pages/sys-admin-folders-trash/sys-admin-folders-trash.component';
import { SysAdminChildFoldersSystemComponent } from './pages/sys-admin-child-folders-system/sys-admin-child-folders-system.component';
import { ModalCreateNewFolderComponent } from './components/modal-create-new-folder/modal-create-new-folder.component';
import {
  ModalFoldersSystemDeleteItemComponent
} from './components/modal-folders-system-delete-item/modal-folders-system-delete-item.component';
import { UserDatabaseComponent } from './pages/user-database/user-database.component';
import { SetQuotaModalComponent } from './components/set-quota-modal/set-quota-modal.component';
import { DeleteUserConfirmationModalComponent } from './components/delete-user-confirmation-modal/delete-user-confirmation-modal.component';
import {
  ResetPasswordConfirmationModalComponent
} from './components/reset-password-confirmation-modal/reset-password-confirmation-modal.component';

import { DeleteAuditlogConfirmModalComponent } from './components/delete-auditlog-confirm-modal/delete-auditlog-confirm-modal.component';

import { UseradminInfoComponent } from './pages/useradmin-info/useradmin-info.component';
import { AddImportUsersModalComponent } from './components/add-import-users-modal/add-import-users-modal.component';
import { UserAdminComponent } from './pages/user-admin/user-admin.component';
import { RevokeAdminConfirmModalComponent } from './components/revoke-admin-confirm-modal/revoke-admin-confirm-modal.component';
import { AddAdminsModalComponent } from './components/add-admins-modal/add-admins-modal.component';
import { UseradminInfoProfilesComponent } from './components/useradmin-info-profiles/useradmin-info-profiles.component';
import { UseradminInfoOwnedLibsComponent } from './components/useradmin-info-owned-folders/useradmin-info-owned-folders.component';
import { UseradminInfoSharedLinksComponent } from './components/useradmin-info-shared-links/useradmin-info-shared-links.component';
import { UseradminInfoGroupsComponent } from './components/useradmin-info-groups/useradmin-info-groups.component';
import { UseradminInfoSharedLibsComponent } from './components/useradmin-info-shared-folders/useradmin-info-shared-folders.component';
import { UseradminInfoMeetingsComponent } from './components/useradmin-info-meetings/useradmin-info-meetings.component';
import { ChildFoldersAllComponent } from './pages/child-folders-all/child-folders-all.component';
import { ModalUnlinkDeviceModule } from '@modules/tools/components/modal-unlink-device/modal-unlink-device.module';
import { GroupsComponent } from './pages/groups/groups.component';
import { TransferGroupComponent } from './components/transfer-group/transfer-group.component';
import { AdminRemoveGroupComponent } from './components/admin-remove-group/admin-remove-group.component';
import { ModalAddNewGroupComponent } from './components/modal-add-new-group/modal-add-new-group.component';
import { GroupFoldersComponent } from './pages/group-folders/group-folders.component';
import { AdminUnshareGroupFolderComponent } from './components/admin-unshare-group-folder/admin-unshare-group-folder.component';
import { GroupManagementComponent } from './pages/group-management/group-management.component';
import { GroupRemoveMemberModalComponent } from './components/group-remove-member-modal/group-remove-member-modal.component';
import { GroupAddMemberModalComponent } from './components/group-add-member-modal/group-add-member-modal.component';
import { SystemNotificationComponent } from './pages/system-notification/system-notification.component';
import { ModalCreateSystemNotificationComponent } from './components/modal-create-system-notification/modal-create-system-notification.component';
import { ModalRemoveSystemNotificationComponent } from './components/modal-remove-system-notification/modal-remove-system-notification.component';
import { ModalEditSystemNotificationComponent } from './components/modal-edit-system-notification/modal-edit-system-notification.component';
import { TenantListComponent } from './pages/tenant-list/tenant-list.component';
import { ModalCreateTenantComponent } from './components/modal-create-tenant/modal-create-tenant.component';
import { ModalRemoveTenantComponent } from './components/modal-remove-tenant/modal-remove-tenant.component';
import { TenantUserListComponent } from './pages/tenant-user-list/tenant-user-list.component';
import { ModalTenantAddMembersComponent } from './components/modal-tenant-add-members/modal-tenant-add-members.component';
import { ModalTenantRemoveMembersComponent } from './components/modal-tenant-remove-members/modal-tenant-remove-members.component';
import { ModalTenantUpdateQuotaComponent } from './components/modal-tenant-update-quota/modal-tenant-update-quota.component';
import { PublicShareLinksComponent } from './pages/public-share-links/public-share-links.component';
import { ModalPublicShareLinkRemoveComponent } from './components/modal-public-share-link-remove/modal-public-share-link-remove.component';
import { ModalGroupRenameComponent } from './components/modal-group-rename/modal-group-rename.component';
import { SudoComponent } from './pages/sudo/sudo.component';
import { ModalCmsFileChooserComponent } from './components/modal-cms-file-chooser/modal-cms-file-chooser.component';
import { ModalInternalShareRemoveComponent } from './components/modal-internal-share-remove/modal-internal-share-remove.component';
import { AdminCreateChildFileModalComponent } from './pages/admin-create-child-file-modal/admin-create-child-file-modal.component';
import { AdminDeleteModalComponent } from './pages/admin-delete-modal/admin-delete-modal.component';
import { AdminTrafficComponent } from './pages/admin-traffic/admin-traffic.component';
import { VirusScanComponent } from './pages/virus-scan/virus-scan.component';
import { EmailChangingRequestComponent } from './pages/email-changing-request/email-changing-request.component';
import { ModalConfirmRemoveEmailChangeRequestComponent } from './components/modal-confirm-remove-email-change-request/modal-confirm-remove-email-change-request.component';
import { AuditlogComponent } from './pages/auditlog/auditlog.component';
import { MeetingListComponent } from './pages/meeting-list/meeting-list.component';
import { MeetingRecordingComponent } from './pages/meeting-recordings/meeting-recordings.component';
import { ModalDeleteMeetingComponent } from './components/modal-delete-meeting/modal-delete-meeting.component';
import { ModalCreateNewMeetingComponent } from './components/modal-create-new-meeting/modal-create-new-meeting.component';
import { ModalDeleteRecordingComponent } from './components/modal-delete-recording/modal-delete-recording.component';
import { BbbServersComponent } from './pages/bbb-servers/bbb-servers.component';
import { ModalCreateEditBbbServerComponent } from './components/modal-create-edit-bbb-server/modal-create-edit-bbb-server.component';

import { NgxPaginationModule } from 'ngx-pagination';
import { ModalDeleteBbbServerConfirmationComponent } from './components/modal-delete-bbb-server-confirmation/modal-delete-bbb-server-confirmation.component';
import { ModalMeetingFileChooserComponent } from './components/modal-meeting-file-chooser/modal-meeting-file-chooser.component';
import { ModalEnterLicenseKeyComponent } from './components/modal-enter-license-key/modal-enter-license-key.component';

@NgModule({
  imports: [
    CommonModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    AdminRoutingModule,
    ModalUnlinkDeviceModule,
    NgxPaginationModule,
    ClipboardModule
  ],
  declarations: [
    LayoutAdminComponent,
    SystemAdminSettingsComponent,
    SysAdminInfoPageComponent,
    DevicesComponent,
    UnlinkDeviceModalComponent,
    SysAdminDevicesDesktopComponent,
    TitleDevicesComponent,
    SysAdminFoldersAllComponent,
    ModalFoldersAllDeleteItemComponent,
    SharesFoldersAllModalComponent,
    ShareToUserFoldersAllComponent,
    ShareToGroupFoldersAllComponent,
    ModalFoldersAllCreateNewComponent,
    SysAdminFoldersSystemComponent,
    SysAdminFoldersTrashComponent,
    SysAdminChildFoldersSystemComponent,
    ModalCreateNewFolderComponent,
    ModalFoldersSystemDeleteItemComponent,
    UserDatabaseComponent,
    SetQuotaModalComponent,
    DeleteUserConfirmationModalComponent,
    ResetPasswordConfirmationModalComponent,
    UseradminInfoComponent,
    AddImportUsersModalComponent,
    UserAdminComponent,
    RevokeAdminConfirmModalComponent,
    AddAdminsModalComponent,
    UseradminInfoProfilesComponent,
    UseradminInfoOwnedLibsComponent,
    UseradminInfoSharedLinksComponent,
    UseradminInfoGroupsComponent,
    UseradminInfoMeetingsComponent,
    UseradminInfoSharedLibsComponent,
    ChildFoldersAllComponent,
    GroupsComponent,
    TransferGroupComponent,
    AdminRemoveGroupComponent,
    ModalAddNewGroupComponent,
    GroupFoldersComponent,
    AdminUnshareGroupFolderComponent,
    GroupManagementComponent,
    GroupRemoveMemberModalComponent,
    GroupAddMemberModalComponent,
    SystemNotificationComponent,
    ModalCreateSystemNotificationComponent,
    ModalRemoveSystemNotificationComponent,
    ModalEditSystemNotificationComponent,
    TenantListComponent,
    ModalCreateTenantComponent,
    ModalRemoveTenantComponent,
    TenantUserListComponent,
    ModalTenantAddMembersComponent,
    ModalTenantRemoveMembersComponent,
    ModalTenantUpdateQuotaComponent,
    PublicShareLinksComponent,
    ModalPublicShareLinkRemoveComponent,
    ModalGroupRenameComponent,
    SudoComponent,
    ModalCmsFileChooserComponent,
    ModalInternalShareRemoveComponent,
    AdminCreateChildFileModalComponent,
    AdminDeleteModalComponent,
    AdminTrafficComponent,
    VirusScanComponent,
    EmailChangingRequestComponent,
    ModalConfirmRemoveEmailChangeRequestComponent,
    AuditlogComponent,
    DeleteAuditlogConfirmModalComponent,
    MeetingListComponent,
    MeetingRecordingComponent,
    ModalDeleteMeetingComponent,
    ModalCreateNewMeetingComponent,
    ModalDeleteRecordingComponent,
    BbbServersComponent,
    ModalCreateEditBbbServerComponent,
    ModalDeleteBbbServerConfirmationComponent,
    ModalMeetingFileChooserComponent,
    ModalEnterLicenseKeyComponent,
  ],
  entryComponents: [
    ModalAddNewGroupComponent,
    AdminUnshareGroupFolderComponent,
    GroupRemoveMemberModalComponent,
    GroupAddMemberModalComponent,
    ModalCreateSystemNotificationComponent,
    ModalRemoveSystemNotificationComponent,
    ModalEditSystemNotificationComponent,
    ModalCreateTenantComponent,
    ModalRemoveTenantComponent,
    ModalTenantAddMembersComponent,
    ModalTenantRemoveMembersComponent,
    ModalTenantUpdateQuotaComponent,
    ModalPublicShareLinkRemoveComponent,
    ModalGroupRenameComponent,
    ModalCmsFileChooserComponent,
    ModalInternalShareRemoveComponent,
    AdminDeleteModalComponent,
    ModalConfirmRemoveEmailChangeRequestComponent,
    ModalDeleteMeetingComponent,
    ModalCreateNewMeetingComponent,
    ModalDeleteRecordingComponent,
    ModalCreateEditBbbServerComponent,
    ModalDeleteBbbServerConfirmationComponent,
    ModalMeetingFileChooserComponent,
      ModalEnterLicenseKeyComponent
  ],
})
export class AdminModule { }
