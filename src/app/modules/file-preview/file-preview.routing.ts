import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard } from '../../guard/index';

// components
import { WrapperComponent } from './components/wrapper/wrapper.component';

const routes: Routes = [
  {
    path: ':repoID',
    component: WrapperComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilePreviewRoutingModule { }
