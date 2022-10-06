import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ModalUnlinkDeviceComponent } from '@modules/tools/components/modal-unlink-device/modal-unlink-device.component';
import { ClipboardModule } from 'ngx-clipboard';

const MODAL_UNLINK_DEVICE_ROUTES = [
  { path: '', component: ModalUnlinkDeviceComponent }
];

@NgModule({
  declarations: [
    ModalUnlinkDeviceComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ClipboardModule
  ],
  exports: [
    ModalUnlinkDeviceComponent
  ]
})

export class ModalUnlinkDeviceModule { }
