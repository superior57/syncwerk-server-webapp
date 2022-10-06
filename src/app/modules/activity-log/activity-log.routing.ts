import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard } from '../../guard/index';

// components
import { LogListComponent } from './pages/log-list/log-list.component';

const routes: Routes = [
  {
    path: '',
    component: LogListComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityLogsRoutingModule { }
