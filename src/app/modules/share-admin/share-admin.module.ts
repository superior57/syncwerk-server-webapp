import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { ShareAdminRoutingModule } from './share-admin.routing';
import { SharedModule } from '@shared/shared.module';
import { FoldersPageComponent } from './pages/folders/folders.page';
import { LayoutShareAdminComponent } from '@modules/share-admin/components/layout-share-admin/layout-share-admin';
import { ViewLinkModalComponent } from './pages/links/component/view-link-modal/view-link-modal.component';
import { ShareAdminListviewComponent } from './components/share-admin-listview/share-admin-listview.component';
import { ShareAdminGridviewComponent } from './components/share-admin-gridview/share-admin-gridview.component';

@NgModule({
  imports: [
    CommonModule,
    ShareAdminRoutingModule,
    FormsModule,
    SharedModule,
    ClipboardModule,
  ],
  declarations: [
    LayoutShareAdminComponent,
    FoldersPageComponent,
    FoldersPageComponent,
    ViewLinkModalComponent,
    ShareAdminListviewComponent,
    ShareAdminGridviewComponent,
  ]
})
export class ShareAdminModule { }
