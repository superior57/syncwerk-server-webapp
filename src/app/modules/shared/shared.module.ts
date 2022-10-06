import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MomentModule } from 'ngx-moment';
import { MarkdownModule } from 'ngx-markdown';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { Select2Module } from 'ng2-select2';
import { CovalentTextEditorModule } from '@covalent/text-editor';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { ClipboardModule } from 'ngx-clipboard';
import { TagInputModule } from 'ngx-chips';
import { FileDropModule } from 'ngx-file-drop';
import { TreeModule } from 'ng2-tree';
import { DropzoneConfigInterface, DropzoneModule } from 'ngx-dropzone-wrapper';
import { ResizableModule } from 'angular-resizable-element';
// import { Ng2TableModule } from 'ng2-table/ng2-table';

// directives
import { FocusDirective } from './directives/focus.directive';
import { InputFileLabelDirective } from './directives/input-file-label.directive';
import { RouteTransformerDirective } from './directives/route-transformer.directive';

// pipes
import { CutStringAnyPipe, SpliceLength } from './pipes/string.pipes';
import { FileIconPathPipe, CustomFileIconPipe, FileSizePipe, ImageDefaultPipe } from './pipes/file.pipes';

// share components
import { ShareModalComponent } from './components/share-modal/share-modal.component';
import { ShareDownloadLinkComponent } from './components/share-download-link/share-download-link.component';
import { ShareUploadLinkComponent } from './components/share-upload-link/share-upload-link.component';
import { ShareToUserComponent } from './components/share-to-user/share-to-user.component';
import { ShareToGroupComponent } from './components/share-to-group/share-to-group.component';
import { SharePasswordProtectComponent } from './components/share-password-protect/share-password-protect.component';
import { ShareSendShareLinkComponent } from './components/share-send-share-link/share-send-share-link.component';

// root file components
import { RootListViewComponent } from './components/root-list-view/root-list-view.component';
import { RootGridViewComponent } from './components/root-grid-view/root-grid-view.component';
import { RootCreateNewFolderModalComponent } from './components/root-create-new-folder-modal/root-create-new-folder-modal.component';
import { RootFilesComponent } from './components/root-files/root-files.component';
import {
  RootChangePasswordFolderModalComponent
} from './components/root-change-password-folder-modal/root-change-password-folder-modal.component';
import { TransferFolderModalComponent } from './components/transfer-folder-modal/transfer-folder-modal.component';
import { RootHistorySettingModalComponent } from './components/root-history-setting-modal/root-history-setting-modal.component';
import { RootShareLinkModalComponent } from './components/root-share-links-modal/root-share-link-modal.component';
import { ShareExistingFoldersModalComponent } from './components/share-existing-folders-modal/share-existing-folders-modal.component';

// child file components
import { ChildFilesComponent } from './components/child-files/child-files.component';
import { ChildListViewComponent } from './components/child-list-view/child-list-view.component';
import { ChildGridViewComponent } from './components/child-grid-view/child-grid-view.component';
import { ChildFileCreateNewModalComponent } from './components/child-file-create-new-modal/child-file-create-new-modal.component';
import { DetailsModalComponent } from './components/details-modal/details-modal.component';
import { ChildFileUploadModalComponent } from './components/child-file-upload-modal/child-file-upload-modal.component';
import { PasswordFolderModalComponent } from './components/password-folder-modal/password-folder-modal.component';
import { UnshareModalComponent } from './components/unshare-modal/unshare-modal.component';

// components
import { PageNotificationComponent } from './components/page-notification/page-notification.component';
import { SecondaryHeaderComponent } from './components/secondary-header/secondary-header.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { EmptyItemComponent } from './components/empty-item/empty-item.component';
// import { ZipProgressComponent } from './components/zip-progress/zip-progress.component';
import { ListGridButtonComponent } from './components/list-grid-button/list-grid-button.component';
import { DeleteFileModalComponent } from './components/delete-file-modal/delete-file-modal.component';
import { CopyMoveModalComponent } from './components/copy-move-modal/copy-move-modal.component';
import { ProcessingComponent } from './components/processing/processing.component';
import { ModalDeleteRemoveComponent } from './components/modal-delete-remove/modal-delete-remove.component';
import { ModalRestoreComponent } from './components/modal-restore/modal-restore.component';
import { ModalCleanTrashComponent } from './components/modal-clean-trash/modal-clean-trash.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { ModalConfirmationComponent } from './components/modal-confirmation/modal-confirmation.component';
import { FormControlFloatDirective } from './directives/form-control-float.directive';
import { FooterComponent } from '@modules/main-page/components/footer/footer.component';
import { Breadcrumbs2Component } from './components/breadcrumbs2/breadcrumbs2.component';
import { ModalEditDescComponent } from './components/modal-edit-desc/modal-edit-desc.component';
import { RowSelectorComponent } from './components/row-selector/row-selector.component';
import { ShareToAllComponent } from '@shared/components/share-to-all/share-to-all.component';
import { ModalTenantAddNewMemberComponent } from './components/modal-tenant-add-new-member/modal-tenant-add-new-member.component';
import { ShareMeetingModalComponent } from './components/share-meeting-modal/share-meeting-modal.component';
import { ShareMeetingModalPublicComponent } from './components/share-meeting-modal-public/share-meeting-modal-public.component';
import { ShareMeetingModalUserComponent } from './components/share-meeting-modal-user/share-meeting-modal-user.component';
import { BBBSettingModalComponent } from './components/bbb-setting-modal/bbb-setting-modal.component';
import { ShareMeetingModalGroupComponent } from './components/share-meeting-modal-group/share-meeting-modal-group.component';
import { ModalChangeUserMaxMeetingComponent } from './components/modal-change-user-max-meeting/modal-change-user-max-meeting.component';
import { FilterKanban } from './pipes/filter-kanban';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient],
      }
    }),
    // PerfectScrollbarModule.forChild(),
    RouterModule,
    MarkdownModule.forChild(),
    CodemirrorModule,
    Select2Module,
    CovalentTextEditorModule,
    PdfViewerModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    TagInputModule,
    FileDropModule,
    TreeModule,
    DropzoneModule,
    PaginationModule,
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    ResizableModule
  ],
  declarations: [
    // pipes
    CutStringAnyPipe,
    SpliceLength,
    FileIconPathPipe,
    CustomFileIconPipe,
    FileSizePipe,
    ImageDefaultPipe,
    FilterKanban,

    // directives
    FocusDirective,
    InputFileLabelDirective,
    FormControlFloatDirective,
    RouteTransformerDirective,

    // share components
    ShareModalComponent,
    ShareDownloadLinkComponent,
    ShareUploadLinkComponent,
    ShareToUserComponent,
    ShareToGroupComponent,
    ShareToAllComponent,
    SharePasswordProtectComponent,
    ShareSendShareLinkComponent,

    // root file components
    RootFilesComponent,
    RootListViewComponent,
    RootGridViewComponent,
    RootCreateNewFolderModalComponent,
    RootChangePasswordFolderModalComponent,
    TransferFolderModalComponent,
    RootHistorySettingModalComponent,
    RootShareLinkModalComponent,
    ShareExistingFoldersModalComponent,

    // child file components
    ChildFilesComponent,
    ChildListViewComponent,
    ChildGridViewComponent,
    ChildFileCreateNewModalComponent,
    ChildFileUploadModalComponent,
    PasswordFolderModalComponent,

    // components
    PageNotificationComponent,
    SecondaryHeaderComponent,
    PageNotFoundComponent,
    BreadcrumbsComponent,
    EmptyItemComponent,
    // ZipProgressComponent,
    ListGridButtonComponent,
    DeleteFileModalComponent,
    DetailsModalComponent,
    CopyMoveModalComponent,
    UnshareModalComponent,
    ProcessingComponent,
    ModalDeleteRemoveComponent,
    ModalRestoreComponent,
    ModalCleanTrashComponent,
    DataTableComponent,
    ModalConfirmationComponent,
    FooterComponent,
    Breadcrumbs2Component,
    ModalEditDescComponent,
    RowSelectorComponent,
    ModalTenantAddNewMemberComponent,
    ShareMeetingModalComponent,
    ShareMeetingModalPublicComponent,
    ShareMeetingModalUserComponent,
    BBBSettingModalComponent,
    ShareMeetingModalGroupComponent,
    ModalChangeUserMaxMeetingComponent,
  ],
  exports: [
    TranslateModule,
    PerfectScrollbarModule,
    MomentModule,
    MarkdownModule,
    CodemirrorModule,
    Select2Module,
    CovalentTextEditorModule,
    PdfViewerModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    TagInputModule,
    FileDropModule,
    TreeModule,
    PaginationModule,
    ModalModule,
    ResizableModule,
    ModalTenantAddNewMemberComponent,
    ShareMeetingModalComponent,

    // pipes
    CutStringAnyPipe,
    SpliceLength,
    FileIconPathPipe,
    CustomFileIconPipe,
    FileSizePipe,
    ImageDefaultPipe,
    FilterKanban,

    // directives
    FocusDirective,
    InputFileLabelDirective,
    FormControlFloatDirective,
    RouteTransformerDirective,

    // share components
    ShareModalComponent,
    // ShareDownloadLinkComponent,
    // ShareUploadLinkComponent,
    // ShareToUserComponent,
    // ShareToGroupComponent,
    SharePasswordProtectComponent,
    ShareSendShareLinkComponent,

    // root file components
    RootFilesComponent,
    RootListViewComponent,
    RootGridViewComponent,
    RootCreateNewFolderModalComponent,
    RootChangePasswordFolderModalComponent,
    TransferFolderModalComponent,
    RootHistorySettingModalComponent,
    RootShareLinkModalComponent,

    // child file components
    ChildFilesComponent,
    ChildListViewComponent,
    ChildGridViewComponent,
    ChildFileCreateNewModalComponent,
    ChildFileUploadModalComponent,
    PasswordFolderModalComponent,

    // components
    PageNotificationComponent,
    SecondaryHeaderComponent,
    PageNotFoundComponent,
    BreadcrumbsComponent,
    EmptyItemComponent,
    // ZipProgressComponent,
    ListGridButtonComponent,
    DeleteFileModalComponent,
    DetailsModalComponent,
    CopyMoveModalComponent,
    UnshareModalComponent,
    ProcessingComponent,
    ModalDeleteRemoveComponent,
    ModalRestoreComponent,
    ModalCleanTrashComponent,
    DataTableComponent,
    ModalConfirmationComponent,
    FooterComponent,
    Breadcrumbs2Component,
    RowSelectorComponent,
  ],
  entryComponents: [
    ModalTenantAddNewMemberComponent,
    ModalConfirmationComponent,
    ShareMeetingModalComponent,
    BBBSettingModalComponent,
    ModalChangeUserMaxMeetingComponent,
  ]
})
export class SharedModule { }
