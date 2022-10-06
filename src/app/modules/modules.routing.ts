import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: './root/root.module#RootModule',
  },
  {
    path: '',
    loadChildren: './main-page/main-page.module#MainPageModule'
  },
  // {
  //   path: 'preview',
  //   loadChildren: './file-preview/file-preview.module.ts#FilePreviewModule'
  // },
  { path: 'error', loadChildren: './error-pages/error-pages.module#ErrorPagesModule' },
  { path: '**', redirectTo: 'error', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleRouting { }
