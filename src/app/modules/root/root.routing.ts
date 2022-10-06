import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard, RegisterGuard, CMSGuard } from '../../guard/index';

// components
import { LoginComponent } from './components/login/login.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ConfirmResetPasswordComponent } from './components/confirm-reset-password/confirm-reset-password.component';
import { RegisterComponent } from './components/register/register.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { CmsPagesComponent } from './pages/cms-pages/cms-pages.component';
import { OnlyOfficeEditorComponent } from './components/only-office-editor/only-office-editor.component';
import { ConfirmEmailChangeRequestComponent } from './pages/confirm-email-change-request/confirm-email-change-request.component';
import { EndMeetingComponent } from './pages/end-meeting/end-meeting.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'accounts/password/reset/confirm/:uidb36_token', component: ConfirmResetPasswordComponent },
  { path: 'share-link', loadChildren: '../share-link/share-link.module#ShareLinkModule' },
  // { path: 'repo', loadChildren: '../repo/repo.module#RepoModule' },
  { path: 'register', component: RegisterComponent, canActivate: [RegisterGuard] },
  { path: 'email-activation/:activationKey', component: ConfirmEmailComponent },
  { path: 'email-change-confirmation/:requestOwner/:requestToken', component: ConfirmEmailChangeRequestComponent },
  { path: 'legal', canActivate: [CMSGuard], component: CmsPagesComponent},
  { path: 'privacy', canActivate: [CMSGuard], component: CmsPagesComponent},
  { path: 'help', canActivate: [CMSGuard], component: CmsPagesComponent},
  { path: 'terms', canActivate: [CMSGuard], component: CmsPagesComponent},
  { path: 'welcome', canActivate: [CMSGuard], component: CmsPagesComponent},
  { path: 'only-office-editor/:repoID', component: OnlyOfficeEditorComponent, canActivate: [AuthGuard]},
  { path: 'end-meeting', component: EndMeetingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RootRoutingModule { }
