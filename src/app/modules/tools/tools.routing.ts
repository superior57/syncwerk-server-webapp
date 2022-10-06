import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard, LoggedinGuard } from '../../guard/index';

// components
import { DevicesComponent } from './components/devices/devices.component';
import { TenantAdminComponent } from './pages/tenant-admin/tenant-admin.component';

const routes: Routes = [
  {
    path: 'devices',
    component: DevicesComponent,
    data:{
      title: [
        {
          str: 'LINKED_DEVICE.PAGE_TITLE',
          translate: true
        }
      ]
    }
  },
  {
    path: 'tenant',
    component: TenantAdminComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
