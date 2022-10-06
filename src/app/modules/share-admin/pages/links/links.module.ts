import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LinksRoutingModule } from './links.routing';
import { SharedModule } from '@shared/shared.module';
import { DownloadLinksPageComponent } from './pages/download-links/download-links.page';
import { UploadLinksPageComponent } from './pages/upload-links/upload-links.page';
import { LayoutLinksComponent } from './component/layout-links/layout-links.component';
// import { ViewLinkModalComponent } from './component/view-link-modal/view-link-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LinksRoutingModule,
    SharedModule,
    ClipboardModule,
  ],
  declarations: [
    DownloadLinksPageComponent,
    UploadLinksPageComponent,
    LayoutLinksComponent,
    // ViewLinkModalComponent,
  ]
})
export class LinksModule { }
