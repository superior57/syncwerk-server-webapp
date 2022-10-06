import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard, RegisterGuard, CMSGuard } from '../../guard/index';
import { BbbServerListComponent } from './pages/bbb-server-list/bbb-server-list.component'

// components


const routes: Routes = [
  {
    path: '',
    component: BbbServerListComponent,
    data:{
      title: [
        {
          str: 'TITLE_PAGE.BBB_SERVER',
          translate: true
        }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BBBServersRoutingModule { }
