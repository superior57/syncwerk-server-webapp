import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// relative modules
import { FilePreviewRoutingModule } from './file-preview.routing';
import { SharedModule } from '../shared/shared.module';

// components
import { WrapperComponent } from './components/wrapper/wrapper.component';
import { PreviewContentComponent } from './components/preview-content/preview-content.component';
import { CustomLinkDialogComponent } from './components/custom-link-dialog/custom-link-dialog.component';
import { CustomImageDialogComponent } from './components/custom-image-dialog/custom-image-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FilePreviewRoutingModule
  ],
  declarations: [
    PreviewContentComponent,
    WrapperComponent,
    CustomLinkDialogComponent,
    CustomImageDialogComponent,
  ],
  entryComponents: [
    CustomLinkDialogComponent,
    CustomImageDialogComponent
  ]
})
export class FilePreviewModule { }
