import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Error404Component } from './pages/error-404/error-404.component';
import { Error502Component } from './pages/error-502/error-502.component';

const routes: Routes = [
  {
    path: '404',
    component: Error404Component
  },
  {
    path: '502',
    component: Error502Component
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleRouting { }
