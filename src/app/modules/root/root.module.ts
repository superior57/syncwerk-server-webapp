import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// relative modules
import { RootRoutingModule } from './root.routing';
import { SharedModule } from '../shared/shared.module';

// components
import { LoginComponent } from './components/login/login.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ConfirmResetPasswordComponent } from './components/confirm-reset-password/confirm-reset-password.component';
import { RegisterComponent } from './components/register/register.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { CookieDisclaimerModalComponent } from './components/cookie-disclaimer-modal/cookie-disclaimer-modal.component';
import { CmsPagesComponent } from './pages/cms-pages/cms-pages.component';
import { OnlyOfficeEditorComponent } from './components/only-office-editor/only-office-editor.component';
import { ConfirmEmailChangeRequestComponent } from './pages/confirm-email-change-request/confirm-email-change-request.component';
import { EndMeetingComponent } from './pages/end-meeting/end-meeting.component';

@NgModule({
  imports: [
    CommonModule,
    RootRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [
    LoginComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ConfirmResetPasswordComponent,
    RegisterComponent,
    ConfirmEmailComponent,
    CookieDisclaimerModalComponent,
    CmsPagesComponent,
    OnlyOfficeEditorComponent,
    ConfirmEmailChangeRequestComponent,
    EndMeetingComponent,
  ],
  entryComponents: [
    CookieDisclaimerModalComponent,
  ]
})
export class RootModule { }
