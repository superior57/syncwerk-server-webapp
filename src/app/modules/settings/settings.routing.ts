import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutSettingsComponent } from './components/layout-settings/layout-settings.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutSettingsComponent,
    data:{
      title: [
        {
          str: 'SETTINGS.PROFILE.SETTING_TITLE',
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
export class SettingsRoutingModule { }
